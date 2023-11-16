import json
import pickle
import pprint
import threading
import time

from channels.generic.websocket import WebsocketConsumer
from wallet.types import Offer

from parser.serializers import OfferSerializer
from parser.models import MarketData
from parser.utils.utils import get_diffs

# from .ws_types import Connection

action_subscribers = []
market_subscribers: dict[str, list[WebsocketConsumer]] = {}
connections = []

# connections: list[Connection] = []
thread_actions = None
thread_market = None
# thread_alive_checker = None

is_first_start = True


def get_update_list(curr: list[dict], prev: list[dict]):
    result = []
    for cb in curr:
        search = [pb for pb in prev if pb['id'] == cb['id']]
        if search:
            diffs = get_diffs(cb, search[0])
            if diffs:
                result.append(cb)
        else:
            result.append(cb)

    for pb in prev:
        search = [cb for cb in curr if cb['id'] == pb['id']]
        if not search:
            pb['available_volume'] = 0
            result.append(pb)
    return result


def update_market(delay=1):
    prev_content = None
    while True:

        try:
            if market_subscribers == {}:
                continue

            for pair in market_subscribers:
                currency = pair.split('-')[0]
                fiat = pair.split('-')[1]

                market_data: MarketData = MarketData.objects.filter(
                    fiat__name=fiat,
                    crypto__name=currency,
                ).first()

                content = {
                    'asks': [o.to_dict() for o in pickle.loads(market_data.ask_offers)],
                    'bids': [o.to_dict() for o in pickle.loads(market_data.bid_offers)],
                }
                #
                if prev_content is None:
                    prev_content = content
                    continue
                # #
                bids_update_list = get_update_list(content['bids'], prev_content['bids'])
                asks_update_list = get_update_list(content['asks'], prev_content['asks'])

                prev_content = content
                #
                if not bids_update_list and not asks_update_list:
                    continue

                content = {
                    'type': 'market_subscribe',
                    'data': {
                        'asks': asks_update_list,
                        'bids': bids_update_list,
                    }
                }
                #
                for conn in market_subscribers[pair]:
                    conn.send(json.dumps(content))
        #
        except Exception as e:
            raise
            print(f"[!] Update Market Error: {e}")

        finally:
            time.sleep(delay)


# action subscription
# def update_actions(delay=1):
#     last_actions_id = 0
#     last_tx_id = 0
#     while 1:
#         try:
#             now = int(time.time()) - 10 * 60
#             actions = MarketAction.objects.filter(timestamp__gte=now)
#             txs = WalletTransaction.objects.filter(timestamp__gte=now)
#
#             if last_tx_id == 0 or last_actions_id == 0:
#                 last_actions_id = actions.last().id
#                 last_tx_id = txs.last().id
#                 continue
#
#             if last_tx_id == txs.last().id and last_actions_id == actions.last().id:
#                 continue
#
#             if txs or actions:
#
#                 action_details = [{
#                     "id": row.id,
#                     "order_id": row.order_id,
#                     "action_type": row.action_type,
#                     "user_id": row.user_id,
#                     "user_name": row.user_name,
#                     "user_avatar_code": row.user_avatar_code,
#                     "old_price": row.old_price,
#                     "new_price": row.new_price,
#                     "offer_type": row.offer_type,
#                     "old_volume": row.old_volume,
#                     "new_volume": row.new_volume,
#                     "timestamp": row.timestamp,
#                 } for row in actions if row.id > last_actions_id]
#
#                 txs_details = [{
#                     "id": t.id,
#                     "account": t.account,
#                     "source": t.source,
#                     "destination": t.destination,
#                     "is_income": t.is_income,
#                     "hash": t.hash,
#                     "timestamp": t.timestamp,
#                     "value": t.value
#                 } for t in txs if t.id > last_tx_id]
#
#                 last_tx_id = txs.last().id
#                 last_actions_id = actions.last().id
#
#                 times = [each.timestamp for each in txs] + [each.timestamp for each in actions]
#                 times.sort()
#
#                 prev_time = 0
#                 counter = 0
#                 period = 60 * 5
#                 next_time = 0
#                 result = []
#
#                 for s in times:
#                     div = s % period
#                     next_time = s - div
#                     if prev_time != next_time:
#                         if prev_time != 0:
#                             result.append({'time': next_time, 'value': counter})
#                         prev_time = next_time
#                         counter = 1
#
#                     else:
#                         counter += 1
#
#                 if next_time == prev_time and next_time != 0:
#                     result.append({'time': next_time + period, 'value': counter})
#
#                 stamps = {'type': 'activity_subscribe', 'data': [result[-1]],
#                           'actions': action_details, 'txs': txs_details}
#
#                 for conn in connections:
#                     for user in conn.get_action_subs():
#                         user.send(json.dumps(stamps))
#
#         except Exception as e:
#             print(f"[*] Error actions update: {e}")
#         finally:
#             time.sleep(delay)


class PresenceConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def connect(self):
        if is_first_start:
            # threading.Thread(target=alive_checker, daemon=True).start()
            # threading.Thread(target=update_actions, daemon=True).start()
            threading.Thread(target=update_market, daemon=True).start()

        if self not in connections:
            connections.append(self)
            self.accept()

    def receive(self, text_data=None, bytes_data=None):
        # global thread_actions, thread_market
        json_data = json.loads(text_data)
        method = json_data['method']

        print(json_data)

        # if method == 'activity_subscribe':
        #     connections[connections.index(ip)].action_subscribe(port)
        #
        # elif method == 'ping':
        #     content = {
        #         'type': 'ping',
        #         'data': 'pong'
        #     }
        #     self.send(json.dumps(content))
        #     connections[connections.index(ip)].update_last_call(port)
        #
        if method == 'market_subscribe':
            limit = json_data['limit']
            currency = json_data['currency']
            fiat = json_data['fiat']

            market_data: MarketData = MarketData.objects.filter(
                fiat__name=fiat,
                crypto__name=currency
            ).first()

            content = {
                'type': 'market_subscribe',
                'data': {
                    'asks': [o.to_dict() for o in pickle.loads(market_data.ask_offers)],
                    'bids': [o.to_dict() for o in pickle.loads(market_data.bid_offers)],
                }
            }
            self.send(json.dumps(content))

            if f"{currency}-{fiat}" not in market_subscribers:
                market_subscribers[f"{currency}-{fiat}"] = []

            market_subscribers[f"{currency}-{fiat}"].append(self)

    def disconnect(self, code):
        if self in connections:
            connections.remove(self)

        for each in market_subscribers:
            if self in market_subscribers[each]:
                market_subscribers[each].remove(self)

    # print()
    # ip = self.scope['client'][0]
    # port = self.scope['client'][1]
    # conn: Connection = connections[connections.index(ip)]
    # conn.remove_port(port)
    #
    # if not conn.ports:
    #     connections.remove(conn)
    #
    # pprint.pprint(connections)

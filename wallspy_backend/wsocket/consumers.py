import json
import pickle
import threading
import time

from channels.generic.websocket import WebsocketConsumer

from parser.models import MarketData, NewAction, WalletTransaction
from parser.utils.utils import get_diffs

action_subscribers = []
market_subscribers: dict[str, list[WebsocketConsumer]] = {}
connections = []
last_ping = {}

is_first_start = True


def get_update_list(curr: list[dict], prev: list[dict]):
    result = []
    for cb in curr:
        search = [pb for pb in prev if pb['id'] == cb['id']]
        if search:

            diffs = get_diffs(cb, search[0])

            if 'orderVolumeLimits' in diffs:
                if diffs['orderVolumeLimits'][0]['max'] != diffs['orderVolumeLimits'][1]['max']:

                    if cb not in result:
                        result.append(cb)

            if 'price' in diffs or 'user' in diffs:
                if cb not in result:
                    result.append(cb)

        else:
            result.append(cb)

    for pb in prev:
        search = [cb for cb in curr if cb['id'] == pb['id']]
        if not search:
            pb['availableVolume'] = 0
            result.append(pb)
    return result


def alive_checker():
    while 1:
        try:
            for conn in connections:
                if int(time.time()) - last_ping[conn] > 30:
                    conn.close()

        except Exception as e:
            print(f"[!] alive_checker Error: {e}")

        finally:
            time.sleep(1)


def update_market(delay=2):
    prev_content = None
    while True:
        try:
            if market_subscribers == {}:
                continue

            for pair in market_subscribers:
                if not market_subscribers[pair]:
                    continue

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

                if prev_content is None:
                    prev_content = content
                    continue

                bids_update_list = get_update_list(content['bids'], prev_content['bids'])
                asks_update_list = get_update_list(content['asks'], prev_content['asks'])

                prev_content = content

                if not bids_update_list and not asks_update_list:
                    continue

                content = {
                    'type': 'market_subscribe',
                    'data': {
                        'asks': asks_update_list,
                        'bids': bids_update_list,
                    }
                }

                for conn in market_subscribers[pair]:
                    conn.send(json.dumps(content))

        except Exception as e:
            # raise
            print(f"[!] Update Market Error: {e}")

        finally:
            time.sleep(delay)


def action_update(delay=2):
    last_actions_id = 0
    last_tx_id = 0
    while 1:
        try:
            if not action_subscribers:
                continue

            now = int(time.time()) - 10 * 60
            actions = NewAction.objects.filter(timestamp__gte=now)
            txs = WalletTransaction.objects.filter(timestamp__gte=now)

            if last_tx_id == 0 or last_actions_id == 0:
                last_actions_id = actions.last().id
                last_tx_id = txs.last().id
                continue

            if last_tx_id == txs.last().id and last_actions_id == actions.last().id:
                continue

            if txs or actions:

                action_details = [{
                    "id": row.id,
                    "order": pickle.loads(row.order),
                    "action_type": row.action_type,
                    "timestamp": row.timestamp,
                } for row in actions if row.id > last_actions_id]

                txs_details = [{
                    "id": t.id,
                    "account": t.account,
                    "source": t.source,
                    "destination": t.destination,
                    "is_income": t.is_income,
                    "hash": t.hash,
                    "timestamp": t.timestamp,
                    "value": t.value
                } for t in txs if t.id > last_tx_id]

                last_tx_id = txs.last().id
                last_actions_id = actions.last().id

                times = [each.timestamp for each in txs] + [each.timestamp for each in actions]
                times.sort()

                prev_time = 0
                counter = 0
                period = 60 * 5
                next_time = 0
                result = []

                for s in times:
                    div = s % period
                    next_time = s - div
                    if prev_time != next_time:
                        if prev_time != 0:
                            result.append({'time': next_time, 'value': counter})
                        prev_time = next_time
                        counter = 1

                    else:
                        counter += 1

                if next_time == prev_time and next_time != 0:
                    result.append({'time': next_time + period, 'value': counter})

                stamps = {'type': 'activity_subscribe', 'data': [result[-1]],
                          'actions': action_details, 'txs': txs_details}

                for conn in action_subscribers:
                    conn.send(json.dumps(stamps))

        except Exception as e:
            print(f"[*] Error actions update: {e}")
        finally:
            time.sleep(delay)


class PresenceConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def connect(self):
        global is_first_start
        if is_first_start:
            threading.Thread(target=alive_checker, daemon=True).start()
            threading.Thread(target=update_market, daemon=True).start()
            threading.Thread(target=action_update, daemon=True).start()
            is_first_start = False

        if self not in connections:
            connections.append(self)
            last_ping[self] = time.time()
            self.accept()
            print(f'connections: {connections}')

        else:
            self.close()

    def receive(self, text_data=None, bytes_data=None):
        json_data = json.loads(text_data)
        method = json_data['method']
        print(json_data)
        if method == 'market_subscribe':
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
            print(f'market_subscribers: {market_subscribers}')

        elif method == 'activity_subscribe':
            action_subscribers.append(self)
            print(f'activity_subscribe: {action_subscribers}')

        elif method == 'ping':
            content = {
                'type': 'ping',
                'data': 'pong'
            }
            self.send(json.dumps(content))
            last_ping[self] = time.time()

    def disconnect(self, code):
        if self in connections:
            connections.remove(self)

        if self in action_subscribers:
            action_subscribers.remove(self)

        for each in market_subscribers:
            if self in market_subscribers[each]:
                market_subscribers[each].remove(self)
        print(f'connections: {connections}')
        print(f'market_subscribers: {market_subscribers}')

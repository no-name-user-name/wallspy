import json
import pickle
import threading
import time

from channels.generic.websocket import WebsocketConsumer
from parser.models import MarketAction

subscribers = []
connections = {}
thread = None


def update_loop(delay=1):
    last_id = 0
    while 1:
        try:
            rows = MarketAction.objects.filter(timestamp__gte=int(time.time()) - 10 * 60)

            if last_id == 0:
                last_id = rows.last().id
                continue

            rows = list(rows)

            if rows:
                if last_id == rows[-1].id:
                    continue

                actions = [{
                    "id": row.id,
                    "order_id": row.order_id,
                    "action_type": row.action_type,
                    "user_id": row.user_id,
                    "user_name": row.user_name,
                    "user_avatar_code": row.user_avatar_code,
                    "old_price": row.old_price,
                    "new_price": row.new_price,
                    "offer_type": row.offer_type,
                    "old_volume": row.old_volume,
                    "new_volume": row.new_volume,
                    "timestamp": row.timestamp,
                } for row in rows if row.id > last_id]

                last_id = rows[-1].id

                times = [each.timestamp for each in rows]

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

                stamps = {'type': 'activity_subscribe', 'data': result[-2:], 'actions': actions}

                for user in subscribers:
                    user.send(json.dumps(stamps))

        except Exception as e:
            print(f"[*] Error loop update: {e}")
            raise

        finally:
            time.sleep(delay)


class PresenceConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def connect(self):
        ip = self.scope['client'][0]

        if connections.get(ip):
            if len(connections[ip]['ports']) < 4:
                connections[ip]['ports'].append(self)
                self.accept()
            else:
                self.close()
        else:
            connections[ip] = {'ports': [self]}
            self.accept()

    def receive(self, text_data=None, bytes_data=None):
        global thread

        json_data = json.loads(text_data)
        method = json_data['method']

        if method == 'activity_subscribe':

            if thread is None:
                thread = threading.Thread(target=update_loop)
                thread.start()

            subscribers.append(self)

    def disconnect(self, code):
        if self in subscribers:
            subscribers.remove(self)

        ip = self.scope['client'][0]
        if connections.get(ip):
            connections.pop(ip)

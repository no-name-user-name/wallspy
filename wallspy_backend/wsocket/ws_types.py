import time

from channels.generic.websocket import WebsocketConsumer


class Connection:
    def __init__(self, ip: str, port: int, ws_obj: WebsocketConsumer):
        self.ip = ip
        self.ports = [port]
        self.ws = {port: ws_obj}
        self._market_sub = []
        self._action_sub = []
        self._last_call = {port: int(time.time())}

    def add_port(self, port: int, ws_obj: WebsocketConsumer):
        self.ports.append(port)
        self.ws[port] = ws_obj
        self._last_call[port] = int(time.time())

    def remove_port(self, port):
        if port in self.ports:
            self.ports.remove(port)
            self.ws.pop(port)
            self._last_call.pop(port)

            if port in self._market_sub:
                self._market_sub.remove(port)
            if port in self._action_sub:
                self._action_sub.remove(port)

    def update_last_call(self, port):
        self._last_call[port] = int(time.time())

    def get_last_call(self, port):
        return self._last_call[port]

    def market_subscribe(self, port):
        self._market_sub.append(port)

    def action_subscribe(self, port):
        self._action_sub.append(port)

    def get_market_subs(self):
        return [self.ws[port] for port in self._market_sub]

    def get_action_subs(self):
        return [self.ws[port] for port in self._action_sub]

    def __eq__(self, ip):
        return self.ip == ip

    def __repr__(self):
        return str({self.ip: self.ports})

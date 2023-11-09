class Proxy:
    def __init__(self, ip: str, port: str, user: str, password: str):
        self.password = password
        self.user = user
        self.port = port
        self.ip = ip


class ProxyManager:
    def __init__(self):
        self.proxy_list = [
            Proxy('188.119.126.66', '9175', 'S2udut', '2xMWvf'),
            Proxy('188.119.126.28', '9148', 'S2udut', '2xMWvf'),
            Proxy('188.119.126.155', '9440', 'S2udut', '2xMWvf'),
        ]

    def count(self):
        return len(self.proxy_list)

    def get(self):
        return self.proxy_list[0]

    def shift(self):
        self.proxy_list = self.proxy_list[1:] + self.proxy_list[: 1]

    def get_next(self):
        self.shift()
        return self.get()

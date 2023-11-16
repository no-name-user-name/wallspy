class BotUser:
    def __init__(self, cid, first_name, last_name, username, rank):
        self.username = username
        self.last_name = last_name
        self.first_name = first_name
        self.cid = cid
        self.rank = rank

        self.mem = {}
        self.step = '-'
        self.last_mid = 0
        self.captcha = ''

    def get(self, arg):
        if arg in self.mem:
            return self.mem[arg]
        else:
            return None

    def set(self, arg, value):
        self.mem[arg] = value


class BotUsers:
    def __init__(self):
        self._users = {}

    def add(self, chat_id: int, first_name: str, last_name: str, username: str, rank: int):
        if chat_id not in self._users:
            self._users[chat_id] = BotUser(chat_id, first_name, last_name, username, rank)

    def find(self, chat_id: int) -> BotUser:
        return self._users[chat_id]

    def list(self):
        return [u for u in self._users]
import datetime
from urllib import parse

from telebot.types import CallbackQuery

from bot.includes.bot import get_bot
from bot.includes.temp import users
from bot.includes.types import BotUser


def handlers(call: CallbackQuery):
    bot = get_bot()
    msg = call.message
    cid = call.from_user.id
    mid = call.message.id
    username = call.from_user.username

    if cid not in users.list():
        return

    user: BotUser = users.find(cid)

    if user.rank < 0:
        return

    callback_log = {
        'cid': cid,
        'username': username,
        'type': 'callback',
        'rank': user.rank,
        'step': user.step,
        'callback': call.data
    }

    print(f"[{datetime.datetime.now()}] {callback_log}")
    query_dict = dict(parse.parse_qsl(call.data))

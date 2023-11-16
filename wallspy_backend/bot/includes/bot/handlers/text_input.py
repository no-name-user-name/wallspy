import base64
import random
from hashlib import md5

from telebot.types import Message

from bot.includes.bot import menu, get_bot
from bot.includes.bot import long_text as lt
from bot.includes.bot.base_functions import check_string
from bot.includes.temp import users
from bot.models import Setting


def handlers(m: Message):
    bot = get_bot()
    cid = m.chat.id
    username = m.from_user.username
    first_name = m.from_user.first_name
    last_name = m.from_user.last_name
    text = m.text
    mid = m.message_id
    bot.delete_message(cid, mid)

    if cid not in users.list():
        return

    user = users.find(cid)
    mid = user.last_mid

    if user.rank < 0:
        return

    match user.step:
        case 'CAPTCHA':
            pass
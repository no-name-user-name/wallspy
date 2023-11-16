import datetime
import io
import os
import re

import telebot
from telebot.types import Chat

from bot.includes.temp import users
from bot.models import Setting, TelegramUser


def get_bot(parse_mode="HTML") -> telebot.TeleBot:
    if 'bot_token' not in os.environ:
        settings: Setting = Setting.objects.all()[0]
        os.environ['bot_token'] = settings.bot_token

    bot = telebot.TeleBot(os.environ['bot_token'], parse_mode=parse_mode)
    return bot


def listener(messages):
    for m in messages:
        cid = m.from_user.id

        if cid in users.list():
            user = users.find(cid)
            rank = user.rank
            step = user.step
        else:
            rank = 0
            step = '-'

        log = {
            'cid': cid,
            'username': m.from_user.username,
            'type': 'text',
            'rank': rank,
            'step': step,
            'text': m.text
        }
        print(f"[{datetime.datetime.now()}] {log}")


def catcherError(func):
    def f(*args, **kwargs):
        try:
            out = func(*args, **kwargs)
            return out
        except Exception as e:
            print(str(e))

    return f


# def image_to_byte_array(image: Image) -> bytes:
#     imgByteArr = io.BytesIO()
#     image.save(imgByteArr, format=image.format)
#     imgByteArr = imgByteArr.getvalue()
#     return imgByteArr


def get_username(chat: Chat = None, db: TelegramUser = None):
    if chat:
        if chat.username == '' or chat.username is None:
            username = '#' + chat.first_name
        else:
            username = '@' + chat.username
    elif db:
        if db.username == '' or db.username is None:
            username = '#' + db.first_name
        else:
            username = '@' + db.username
    else:
        raise Exception("[!] `chat` or `db` require")
    return username


def check_string(input_string):
    pattern = re.compile(r'[а-яА-Я\s\W]')
    if pattern.search(input_string):
        return False
    else:
        return True

import uuid

from telebot.types import Message

from bot.includes.bot import menu
from bot.includes.temp import users
from bot.models import TelegramUser
from bot.includes.bot import long_text as lt

def start(m: Message):
    cid = m.from_user.id
    first_name = m.from_user.first_name
    username = m.from_user.username
    last_name = m.from_user.last_name

    ignor_list = [0]

    if cid not in users.list():
        users.add(cid, first_name, last_name, username, 1)
        TelegramUser(
            username=username,
            password=uuid.uuid4().hex.upper()[0:6],
            first_name=first_name,
            last_name=last_name,
            tg_id=cid,
            is_premium=m.from_user.is_premium,
            language_code=m.from_user.language_code,
            photo_url='',
            allows_write_to_pm=True,
            status=1,
        ).save()

        menu.main(cid)

    elif users.find(cid).rank in ignor_list:
        pass

    else:
        menu.main(cid)

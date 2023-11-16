from time import sleep

from bot.includes.bot.base_functions import get_bot, listener
from bot.includes.bot.handlers import setup_handlers
from bot.includes.temp import users
from bot.models import TelegramUser


def start():
    for worker in TelegramUser.objects.all():
        users.add(
            worker.tg_id,
            worker.first_name,
            worker.last_name,
            worker.username,
            worker.status
        )

    print('[*] Bot started!')
    while 1:
        try:
            bot = get_bot()
            bot.set_update_listener(listener)
            setup_handlers(bot)
            bot.infinity_polling()
        except Exception as e:
            print(f"Ошибка в работе бота: `{e}`. Попытка перезапуска через 5 секунд...")

            sleep(5)

import os
import threading

from django.apps import AppConfig


class BotConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bot'

    def ready(self):
        if 'RUN_MAIN' in os.environ:
            from bot.includes.bot import start
            threading.Thread(target=start, daemon=True).start()

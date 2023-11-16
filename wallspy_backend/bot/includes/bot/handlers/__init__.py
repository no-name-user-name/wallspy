from telebot import TeleBot

from bot.includes.bot.handlers import cmds, callbacks, text_input, inline


def setup_handlers(bot: TeleBot):
    bot.register_message_handler(cmds.start, commands=['start'], chat_types=['private'])

    bot.register_callback_query_handler(callbacks.handlers, func=lambda call: True)

    # bot.register_inline_handler(inline.handler, lambda query: query.query == 'refund')

    bot.register_message_handler(text_input.handlers, content_types=['text'], chat_types=['private'])

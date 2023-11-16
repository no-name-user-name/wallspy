from telebot import types

from bot.includes.bot import get_bot


def handler(call):
    bot = get_bot()

    bot.answer_inline_query(call.id, [
        types.InlineQueryResultArticle('1', 'Result1', types.InputTextMessageContent('hi')),
        types.InlineQueryResultArticle('2', 'Result2', types.InputTextMessageContent('hi'))
    ])

    print(call)
    # print(1)

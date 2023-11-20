import datetime
import time

from telebot import types

from bot.includes.bot import get_bot
from parser.models import WalletTransaction, User, Statistic
import prettytable as pt


def downs(call):
    bot = get_bot()

    days_before = (datetime.date.today() - datetime.timedelta(days=1)).timetuple()
    timestamp = int(time.mktime(days_before))
    active_users = User.objects.filter(last_activity__gte=timestamp)
    users = []
    for user in active_users:
        stats = Statistic.objects.filter(user_id=user.user_id, timestamp__gte=timestamp)
        start_stats: Statistic = stats.first()
        last_stats: Statistic = stats.last()

        if float(last_stats.success_percent) > 40:
            continue

        delta = last_stats.total_orders_count - start_stats.total_orders_count
        users.append({
            'id': user.user_id,
            'avatar_code': user.avatar_code,
            'last_activity': user.last_activity,
            'nickname': user.nickname,
            'is_verified': user.is_verified,
            'delta': delta,
            'start_stats': {
                'total_orders_count': start_stats.total_orders_count,
                'success_percent': start_stats.success_percent,
                'success_rate': start_stats.success_rate,
            },
            'last_stats': {
                'total_orders_count': last_stats.total_orders_count,
                'success_percent': last_stats.success_percent,
                'success_rate': last_stats.success_rate,
            }
        })
    user_sort = sorted(users, reverse=True, key=lambda x: x['delta'])[0:10]

    table = pt.PrettyTable(['#', 'USERNAME', '24H', 'SUCCESS'])
    table.align['#'] = 'l'
    table.align['USERNAME'] = 'l'
    table.align['24H'] = 'l'
    table.align['SUCCESS'] = 'l'
    data = []

    i = 0
    for u in user_sort:
        i += 1
        data.append(
            (f"{i}", f"{u['nickname']}", f"+{u['delta']}",

             f"{round(float(u['last_stats']['success_rate']), 1)}%")
        )

    for _number, _user, _daily, _all in data:
        table.add_row([_number, _user, _daily, _all])

    bot.answer_inline_query(call.id, [
        types.InlineQueryResultArticle(
            'daily_scamers',
            'Скамеры за 24 часа',
            input_message_content=types.InputTextMessageContent(
                f"🛑 Претенденты на бан за сегодня:\n<pre>{table}</pre>", parse_mode='HTML'),
            description='Скамеры @Wallet',
            thumbnail_url='https://img.freepik.com/free-vector/trophy_78370-345.jpg'
        )
    ])


def top_makers(call):
    bot = get_bot()

    days_before = (datetime.date.today() - datetime.timedelta(days=1)).timetuple()
    timestamp = int(time.mktime(days_before))
    active_users = User.objects.filter(last_activity__gte=timestamp)
    users = []
    for user in active_users:
        stats = Statistic.objects.filter(user_id=user.user_id, timestamp__gte=timestamp)
        start_stats: Statistic = stats.first()
        last_stats: Statistic = stats.last()

        if float(last_stats.success_percent) < 90:
            continue

        delta = last_stats.total_orders_count - start_stats.total_orders_count
        users.append({
            'id': user.user_id,
            'avatar_code': user.avatar_code,
            'last_activity': user.last_activity,
            'nickname': user.nickname,
            'is_verified': user.is_verified,
            'delta': delta,
            'start_stats': {
                'total_orders_count': start_stats.total_orders_count,
                'success_percent': start_stats.success_percent,
                'success_rate': start_stats.success_rate,
            },
            'last_stats': {
                'total_orders_count': last_stats.total_orders_count,
                'success_percent': last_stats.success_percent,
                'success_rate': last_stats.success_rate,
            }
        })
    user_sort = sorted(users, reverse=True, key=lambda x: x['delta'])[0:10]

    table = pt.PrettyTable(['#', 'USERNAME', '24H', 'ALL'])
    table.align['#'] = 'l'
    table.align['USERNAME'] = 'l'
    table.align['24H'] = 'l'
    table.align['ALL'] = 'l'
    data = []

    i = 0
    for u in user_sort:
        i += 1
        symbol = ''
        if u['is_verified']:
            symbol = '✓'

        data.append(
            (f"{i}", f"{u['nickname']} {symbol}", f"+{u['delta']}", u['last_stats']['total_orders_count'])
        )

    for _number, _user, _daily, _all in data:
        table.add_row([_number, _user, _daily, _all])

    bot.answer_inline_query(call.id, [
        types.InlineQueryResultArticle(
            'daily_mm_top',
            'Топ за 24 часа',
            input_message_content=types.InputTextMessageContent(
                f"🏆 Лучшие торговцы за 24 часа:\n<pre>{table}</pre>", parse_mode='HTML'),
            description='Лучшие макетмейкеры @Wallet',
            thumbnail_url='https://img.freepik.com/free-vector/trophy_78370-345.jpg'
        )
    ])

    print(call)
    # print(1)

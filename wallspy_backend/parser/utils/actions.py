import time

from wallet.types import Offer, ActionTypes

from parser.models import MarketAction, UserStat, User
from parser.utils.utils import to_fixed

prev_offers = None


def actions_handler(bid_offers: list[Offer], ask_offers: list[Offer], market_price: float):
    global prev_offers
    current_offers: list[Offer] = bid_offers + ask_offers

    for offer in current_offers:
        offer.price.value = to_fixed(offer.price.value, 2)
        offer.profit_percent = to_fixed(offer.price.value / market_price * 100, 2)

    if prev_offers is None:
        prev_offers = current_offers
        return

    for prev in prev_offers:
        curr = [offer for offer in current_offers if prev.id == offer.id]

        if not curr:
            MarketAction(
                order_id=prev.id,
                action_type=ActionTypes.offer_delete,
                user_id=prev.user.userId,
                user_name=prev.user.nickname,
                user_avatar_code=prev.user.avatarCode,
                offer_type=prev.type,
                timestamp=int(time.time())
            ).save()
            print(f'[-] Delete offer | {prev.user.nickname}')

    for curr in current_offers:
        prev = [offer for offer in prev_offers if offer.id == curr.id]
        if prev:
            prev = prev[0]

            if curr.profit_percent > 0.2 + prev.profit_percent and curr.price.value != prev.price.value:
                MarketAction(
                    order_id=curr.id,
                    action_type=ActionTypes.price_change,
                    user_id=curr.user.userId,
                    user_name=curr.user.nickname,
                    user_avatar_code=curr.user.avatarCode,
                    old_price=prev.price.value,
                    new_price=curr.price.value,
                    offer_type=curr.type,
                    timestamp=int(time.time())
                ).save()
                print(f'[^] Price up {prev.price.value} => {curr.price.value} | '
                      f'{prev.profit_percent}% => {curr.profit_percent}% | '
                      f'{curr.user.nickname}')

            elif curr.profit_percent + 0.2 < prev.profit_percent and curr.price.value != prev.price.value:
                MarketAction(
                    order_id=curr.id,
                    action_type=ActionTypes.price_change,
                    user_id=curr.user.userId,
                    user_name=curr.user.nickname,
                    user_avatar_code=curr.user.avatarCode,
                    old_price=prev.price.value,
                    new_price=curr.price.value,
                    offer_type=curr.type,
                    timestamp=int(time.time())
                ).save()
                print(f'[^] Price down {curr.price.value} => {prev.price.value} | '
                      f'{curr.profit_percent}% => {prev.profit_percent}% | '
                      f'{curr.user.nickname}')

            elif curr.availableVolume > prev.availableVolume:
                MarketAction(
                    order_id=curr.id,
                    action_type=ActionTypes.volume_change,
                    user_id=curr.user.userId,
                    user_name=curr.user.nickname,
                    user_avatar_code=curr.user.avatarCode,
                    old_volume=prev.availableVolume,
                    new_volume=curr.availableVolume,
                    offer_type=curr.type,
                    timestamp=int(time.time())
                ).save()
                print(f'[^] Volume up {prev.availableVolume} => {curr.availableVolume} | {curr.user.nickname}')

            elif curr.availableVolume < prev.availableVolume:
                MarketAction(
                    order_id=curr.id,
                    action_type=ActionTypes.volume_change,
                    user_id=curr.user.userId,
                    user_name=curr.user.nickname,
                    user_avatar_code=curr.user.avatarCode,
                    old_volume=prev.availableVolume,
                    new_volume=curr.availableVolume,
                    offer_type=curr.type,
                    timestamp=int(time.time())
                ).save()

                if curr.type == 'SALE':
                    print(f'[$] Sale {prev.availableVolume - curr.availableVolume} TON | {curr.user.nickname}')
                else:
                    print(f'[$] Buy {prev.availableVolume - curr.availableVolume} TON | {curr.user.nickname}')

        else:
            MarketAction(
                order_id=curr.id,
                action_type=ActionTypes.offer_add,
                user_id=curr.user.userId,
                user_name=curr.user.nickname,
                user_avatar_code=curr.user.avatarCode,
                offer_type=curr.type,
                timestamp=int(time.time())
            ).save()
            print(f'[+] New offer | {curr.user.nickname}')

    for curr in current_offers:
        user = User.objects.filter(user_id=curr.user.userId).first()
        if user:
            if user.is_verified != curr.user.isVerified or \
                    user.nickname != curr.user.nickname or \
                    user.avatar_code != curr.user.avatarCode:
                user.is_verified = curr.user.isVerified
                user.nickname = curr.user.nickname
                user.avatar_code = curr.user.avatarCode
                user.save()

                print(f'[+] Update acc | {user.nickname} => {curr.user.nickname} | '
                      f'{user.avatar_code} => {curr.user.avatarCode} | {user.is_verified} => {curr.user.isVerified}')

            stats: UserStat = UserStat.objects.filter(user_id=curr.user.userId).last()
            if stats:
                if stats.success_percent != curr.user.statistics.successPercent or \
                        stats.total_orders_count != curr.user.statistics.totalOrdersCount:
                    UserStat(
                        total_orders_count=curr.user.statistics.totalOrdersCount,
                        success_percent=curr.user.statistics.successPercent,
                        user_id=curr.user.userId,
                        success_rate=curr.user.statistics.successRate,
                        timestamp=int(time.time())
                    ).save()
                    user.last_activity = int(time.time())
                    user.save()
                    print(f'[+] Update stats: {curr.user.nickname} | {curr.user.statistics}')

        else:
            new_user = User(
                nickname=curr.user.nickname,
                avatar_code=curr.user.avatarCode,
                user_id=curr.user.userId,
                is_verified=curr.user.isVerified,
            )
            new_user.save()

            UserStat(
                total_orders_count=curr.user.statistics.totalOrdersCount,
                success_percent=curr.user.statistics.successPercent,
                user_id=curr.user.statistics.userId,
                success_rate=curr.user.statistics.successRate,
                timestamp=int(time.time())
            ).save()

            print(f'[+] Add user | {curr.user.nickname}')

    prev_offers = current_offers

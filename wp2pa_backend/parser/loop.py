import requests
import os
import pickle
import threading
import time

from django.db import models

from wallet.rest import Wallet
from wallet.types import Action, ActionTypes, Offer
from wallet.web_client import Client

from .models import MarketAction, WalletTransaction, MarketData, Balance, User, UserStat


def token_update(delay=60 * 10):
    while 1:
        try:
            # for new telegram connection
            # client = Client.auth('main')

            # for old tg connection
            client = Client(headless=True)

            token = client.get_token()
            os.environ['wallet_token'] = token
            client.driver.quit()
            #
            time.sleep(delay)
        except Exception as e:
            print(f"[!] Token_update error: {e}")
            time.sleep(10)


prev_offers = None


def to_fixed(x, y):
    return float("{:.2f}".format(x))


def wallet_tx_update():
    next_balance_parser_time = 0
    while 1:
        try:
            if time.time() > next_balance_parser_time:
                next_balance_parser_time = time.time() + 60 * 10
                r = requests.get('https://toncenter.com/api/v2/getWalletInformation?address=EQBDanbCeUqI4_v'
                                 '-xrnAN0_I2wRvEIaLg1Qg2ZN5c6Zl1KOh').json()

                Balance(
                    value=int(r['result']['balance']),
                    timestamp=time.time()
                ).save()

            prev_txs: list[WalletTransaction] = list(WalletTransaction.objects.all().order_by('-id')[:100])
            new_txs = requests.get(
                'https://api.ton.cat/v2/contracts/address/EQBDanbCeUqI4_v-xrnAN0_I2wRvEIaLg1Qg2ZN5c6Zl1KOh'
                '/transactions?limit=100&offset=0').json()

            if new_txs:
                new_txs.reverse()

            if not new_txs:
                continue

            i = 0
            for tx in new_txs:
                account = tx['account']
                tx_hash = tx['hash']
                timestamp = tx['utime']

                if len([pt for pt in prev_txs if pt.hash == tx_hash]) != 0:
                    continue

                if tx['out_msgs']:
                    is_income = False
                    source = tx['out_msgs'][0]['source']
                    destination = tx['out_msgs'][0]['destination']
                    value = tx['out_msgs'][0]['value']

                else:
                    is_income = True
                    source = tx['in_msg']['source']
                    destination = tx['in_msg']['destination']
                    value = tx['in_msg']['value']

                WalletTransaction(
                    account=account,
                    source=source,
                    destination=destination,
                    is_income=is_income,
                    value=value,
                    hash=tx_hash,
                    timestamp=timestamp
                ).save()
                i += 1
            print(f'[*] Saved {i} new txs')

        except Exception as e:
            print(f"[!] Tonscan loop error: {e}")

        finally:
            time.sleep(5)


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


def activate(delay=3):
    print('[*] Activate')

    token = ''

    addr_parser = threading.Thread(target=wallet_tx_update)
    addr_parser.daemon = True
    addr_parser.start()

    t = threading.Thread(target=token_update)
    t.daemon = True
    t.start()

    print('[*] Wait new token...')
    while token == '':
        if os.environ.get('wallet_token'):
            token = os.environ['wallet_token']

        time.sleep(5)
        print('[*] ...')
    #
    while 1:
        try:
            token = os.environ['wallet_token']

            w = Wallet(auth_token=token)
            time.sleep(3)
            bid_offers = w.get_p2p_market('TON', 'RUB', 'SALE')
            time.sleep(3)
            ask_offers = w.get_p2p_market('TON', 'RUB', 'PURCHASE')
            market_price = to_fixed(w.get_rate(), 2)

            row = MarketData.objects.first()

            if row is None:
                row: models.Model = MarketData(
                    bid_offers=pickle.dumps(bid_offers), ask_offers=pickle.dumps(ask_offers))
            else:
                row.bid_offers = pickle.dumps(bid_offers)
                row.ask_offers = pickle.dumps(ask_offers)

            row.save()

            actions_handler(bid_offers, ask_offers, market_price)

        except Exception as e:
            print(f"[!] Wallet api parser loop error: {e}")

        finally:
            time.sleep(delay)


if __name__ == '__main__':
    activate(5)

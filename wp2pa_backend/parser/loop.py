import requests
import os
import pickle
import threading
import time

from django.db import models

from wallet.rest import Wallet
from wallet.types import Action, ActionTypes, Offer
from wallet.web_client import Client

from .models import MarketAction, WalletTransaction, MarketData, Balance


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


def actions_handler(bid_offers, ask_offers, market_price):
    global prev_offers

    current_offers: [Offer] = bid_offers + ask_offers

    for offer in current_offers:
        offer.price = to_fixed(offer.price, 2)
        offer.profit_percent = to_fixed(offer.price / market_price * 100, 2)

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
                user_avatar_code=prev.user.avatar_code,
                offer_type=prev.type,
                timestamp=int(time.time())
            ).save()
            print(f'[-] Delete offer | {prev.user.nickname}')

    for curr in current_offers:
        prev = [offer for offer in prev_offers if offer.id == curr.id]
        if prev:
            prev = prev[0]

            if curr.profit_percent > 0.2 + prev.profit_percent and curr.price != prev.price:
                MarketAction(
                    order_id=curr.id,
                    action_type=ActionTypes.price_change,
                    user_id=curr.user.userId,
                    user_name=curr.user.nickname,
                    user_avatar_code=curr.user.avatar_code,
                    old_price=prev.price,
                    new_price=curr.price,
                    offer_type=curr.type,
                    timestamp=int(time.time())
                ).save()
                print(f'[^] Price up {prev.price} => {curr.price} | '
                      f'{prev.profit_percent}% => {curr.profit_percent}% | '
                      f'{curr.user.nickname}')

            elif curr.profit_percent + 0.2 < prev.profit_percent and curr.price != prev.price:
                MarketAction(
                    order_id=curr.id,
                    action_type=ActionTypes.price_change,
                    user_id=curr.user.userId,
                    user_name=curr.user.nickname,
                    user_avatar_code=curr.user.avatar_code,
                    old_price=prev.price,
                    new_price=curr.price,
                    offer_type=curr.type,
                    timestamp=int(time.time())
                ).save()
                print(f'[^] Price down {curr.price} => {prev.price} | '
                      f'{curr.profit_percent}% => {prev.profit_percent}% | '
                      f'{curr.user.nickname}')

            elif curr.available_volume > prev.available_volume:
                MarketAction(
                    order_id=curr.id,
                    action_type=ActionTypes.volume_change,
                    user_id=curr.user.userId,
                    user_name=curr.user.nickname,
                    user_avatar_code=curr.user.avatar_code,
                    old_volume=prev.available_volume,
                    new_volume=curr.available_volume,
                    offer_type=curr.type,
                    timestamp=int(time.time())
                ).save()
                print(f'[^] Volume up {prev.available_volume} => {curr.available_volume} | {curr.user.nickname}')

            elif curr.available_volume < prev.available_volume:
                MarketAction(
                    order_id=curr.id,
                    action_type=ActionTypes.volume_change,
                    user_id=curr.user.userId,
                    user_name=curr.user.nickname,
                    user_avatar_code=curr.user.avatar_code,
                    old_volume=prev.available_volume,
                    new_volume=curr.available_volume,
                    offer_type=curr.type,
                    timestamp=int(time.time())
                ).save()

                if curr.type == 'SALE':
                    print(f'[$] Sale {prev.available_volume - curr.available_volume} TON | {curr.user.nickname}')
                else:
                    print(f'[$] Buy {prev.available_volume - curr.available_volume} TON | {curr.user.nickname}')

        else:
            MarketAction(
                order_id=curr.id,
                action_type=ActionTypes.offer_add,
                user_id=curr.user.userId,
                user_name=curr.user.nickname,
                user_avatar_code=curr.user.avatar_code,
                offer_type=curr.type,
                timestamp=int(time.time())
            ).save()
            print(f'[+] New offer | {curr.user.nickname}')

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

            row = MarketData.objects.all().first()

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

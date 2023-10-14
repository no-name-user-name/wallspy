import os
import pickle
import threading
import time

from django.db import models

from wallet.rest import Wallet
from wallet.types import Action, ActionTypes, Offer
from wallet.web_client import Client

from .models import MarketData

from .models import MarketAction


def token_update(delay=60 * 10):
    while 1:
        try:
            # for new telegram connection
            # client = Client.auth('main')

            # for old tg connection
            client = Client('main')

            token = client.get_token()
            os.environ['wallet_token'] = token
            client.driver.quit()
            #
            time.sleep(delay)
        except Exception as e:
            print(f"[!] Token_update error: {e}")
            time.sleep(10)


#
#
memory = {
    'offer_price_percent': {},
    'prev_offer_price_percent': {}
}


def actions_handler(bid_offers, ask_offers, market_price):
    offers: [Offer] = bid_offers + ask_offers

    for o in offers:
        memory['offer_price_percent'] = {}
        offer_price_percent = round(o.price / market_price * 100, 1)
        memory['offer_price_percent'][o.id] = offer_price_percent

        # price change
        for cur_offer in offers:
            if cur_offer.id in memory['prev_offer_price_percent'] and cur_offer.id in memory['offer_price_percent']:
                cur_price = memory['offer_price_percent'][cur_offer.id]
                prev_price = memory['prev_offer_price_percent'][cur_offer.id]

                if cur_price > prev_price:
                    MarketAction(
                        order_id=cur_offer.id,
                        action_type=ActionTypes.price_change,
                        user_id=cur_offer.user.userId,
                        user_name=cur_offer.user.nickname,
                        user_avatar_code=cur_offer.user.avatar_code,
                        old_price=prev_price,
                        new_price=cur_price,
                        offer_type=cur_offer.type,
                    ).save()

                    print(f"Price up: {prev_price} => {cur_price}")

                elif cur_price < prev_price:
                    MarketAction(
                        order_id=cur_offer.id,
                        action_type=ActionTypes.price_change,
                        user_id=cur_offer.user.userId,
                        user_name=cur_offer.user.nickname,
                        user_avatar_code=cur_offer.user.avatar_code,
                        old_price=prev_price,
                        new_price=cur_price,
                        offer_type=cur_offer.type,
                    ).save()
                    print(f"Price down: {prev_price} => {cur_price}")

    if 'prev_offers' in memory:
        prev_offers: list[Offer] = memory['prev_offers']

        # del pos
        for prev_offer in prev_offers:
            flag = False
            for cur_offer in offers:
                if cur_offer.id == prev_offer.id:
                    flag = True
                    break

            if not flag:
                MarketAction(
                    order_id=prev_offer.id,
                    action_type=ActionTypes.offer_delete,
                    user_id=prev_offer.user.userId,
                    user_name=prev_offer.user.nickname,
                    user_avatar_code=prev_offer.user.avatar_code,
                    # old_price=prev_price,
                    # new_price=cur_price,
                    offer_type=prev_offer.type,
                ).save()

                print('Offer delete')

        # add pos
        for cur_offer in offers:
            flag = False
            for prev_offer in prev_offers:
                if cur_offer.id == prev_offer.id:
                    flag = True
                    break
            if not flag:

                MarketAction(
                    order_id=cur_offer.id,
                    action_type=ActionTypes.offer_add,
                    user_id=cur_offer.user.userId,
                    user_name=cur_offer.user.nickname,
                    user_avatar_code=cur_offer.user.avatar_code,
                    # old_price=prev_price,
                    # new_price=cur_price,
                    offer_type=cur_offer.type,
                ).save()

                print('Offer added')

        # volume edit
        for cur_offer in offers:
            for prev_offer in prev_offers:
                if cur_offer.id == prev_offer.id:
                    cur_vol = cur_offer.available_volume
                    prev_vol = prev_offer.available_volume
                    offer_type = cur_offer.type

                    if offer_type == 'PURCHASE':

                        if cur_vol > prev_vol:

                            MarketAction(
                                order_id=cur_offer.id,
                                action_type=ActionTypes.volume_change,
                                user_id=cur_offer.user.userId,
                                user_name=cur_offer.user.nickname,
                                user_avatar_code=cur_offer.user.avatar_code,
                                old_volume=prev_vol,
                                new_volume=cur_vol,
                                offer_type=offer_type,
                            ).save()
                            print(f'Increase volume {prev_vol} => {cur_vol}')

                        elif cur_vol < prev_vol:

                            MarketAction(
                                order_id=cur_offer.id,
                                action_type=ActionTypes.volume_change,
                                user_id=cur_offer.user.userId,
                                user_name=cur_offer.user.nickname,
                                user_avatar_code=cur_offer.user.avatar_code,
                                old_volume=prev_vol,
                                new_volume=cur_vol,
                                offer_type=offer_type,
                            ).save()
                            print(
                                f'Decrease volume {prev_vol} => {cur_vol}, or buy {round(prev_vol - cur_vol, 2)} TON')

                    else:
                        if cur_vol > prev_vol:

                            MarketAction(
                                order_id=cur_offer.id,
                                action_type=ActionTypes.volume_change,
                                user_id=cur_offer.user.userId,
                                user_name=cur_offer.user.nickname,
                                user_avatar_code=cur_offer.user.avatar_code,
                                old_volume=prev_vol,
                                new_volume=cur_vol,
                                offer_type=offer_type,
                            ).save()
                            print(f'Increase volume {prev_vol} => {cur_vol}')

                        elif cur_vol < prev_vol:

                            MarketAction(
                                order_id=cur_offer.id,
                                action_type=ActionTypes.volume_change,
                                user_id=cur_offer.user.userId,
                                user_name=cur_offer.user.nickname,
                                user_avatar_code=cur_offer.user.avatar_code,
                                old_volume=prev_vol,
                                new_volume=cur_vol,
                                offer_type=offer_type,
                            ).save()
                            print(
                                f'Decrease volume {prev_vol} => {cur_vol}, or sell {round(prev_vol - cur_vol, 2)} TON')


    memory['prev_offers'] = offers
    memory['prev_offer_price_percent'] = memory['offer_price_percent']


def activate(delay=10):
    print('[*] Activate')

    token = ''

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
            bid_offers = w.get_p2p_market('TON', 'RUB', 'SALE')
            ask_offers = w.get_p2p_market('TON', 'RUB', 'PURCHASE')
            market_price = w.get_rate()

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
    activate()

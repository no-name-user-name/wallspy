import asyncio

import aiohttp
from asgiref.sync import sync_to_async

# from wallet.types import OrderAmountLimits, OrderVolumeLimits

# from wallet.types import Offer

from parser.utils.my_proxy import ProxyManager, Proxy
from parser.utils.utils import gather_with_concurrency
from .models import Setting, FiatCurrency, CryptoCurrency, Offer, Price, PaymentMethod, OrderAmountLimit, \
    OrderVolumeLimit, User, Statistic


@sync_to_async
def create_offer(o):
    offer = Offer(
        id=o['id'],
        number=o['number'],
        available_volume=o['availableVolume'],
        type=o['type'],
        price=Price(
            base_currency_code=o['price']['baseCurrencyCode'],
            quote_currency_code=o['price']['quoteCurrencyCode'],
            type=o['price']['type'],
            value=o['price']['value'],
        ),
        order_amount_limit=OrderAmountLimit(
            min=o['orderAmountLimits']['min'],
            max=o['orderAmountLimits']['max'],
            currency_code=o['orderAmountLimits']['currencyCode'],
            approximate=o['orderAmountLimits']['approximate'],
        ),
        order_volume_limit=OrderVolumeLimit(
            min=o['orderVolumeLimits']['min'],
            currency_code=o['orderVolumeLimits']['currencyCode'],
            max=o['orderVolumeLimits']['max'],
            approximate=o['orderAmountLimits']['approximate'],
        ),
        # payment_methods=[
        #     PaymentMethod(
        #         name=m['name'],
        #         name_eng=m['nameEng'],
        #         code=m['code'],
        #         origin_name_locale=m['originNameLocale'],
        #     ) for m in o['paymentMethods']
        # ],
        user=User(
            user_id=o['user']['userId'],
            nickname=o['user']['nickname'],
            avatar_code=o['user']['avatarCode'],
            is_verified=o['user']['isVerified'],
            last_activity=0,
            statistics=Statistic(
                user_id=o['user']['statistics']['userId'],
                total_orders_count=o['user']['statistics']['totalOrdersCount'],
                success_percent=o['user']['statistics']['successRate'],
                success_rate=o['user']['statistics']['successPercent'],
            ),
        )
    )
    # offer.payment_method.set([PaymentMethod(
    #     name=m['name'],
    #     name_eng=m['nameEng'],
    #     code=m['code'],
    #     origin_name_locale=m['originNameLocale'],
    # ) for m in o['paymentMethods']])
    return offer


async def parse(pair, token, session, timeout, proxy: Proxy):
    offers = []
    endpoint = 'https://walletbot.me'
    types = ['SALE', 'PURCHASE']
    json_data = {
        "baseCurrencyCode": pair[0],
        "quoteCurrencyCode": pair[1],
        "offerType": types[0],
        "offset": 0,
        "limit": 100,
        "desiredAmount": None
    }
    headers = {
        'content-type': 'application/json',
        'authorization': f'Bearer {token}'
    }
    url = endpoint + '/p2p/public-api/v2/offer/depth-of-market'
    proxy_txt = f'http://{proxy.user}:{proxy.password}@{proxy.ip}:{proxy.port}'
    async with session.request('POST', url, headers=headers, json=json_data, proxy=proxy_txt, timeout=timeout) as r:
        if r.content_type != 'application/json' or r.status != 200:
            print(f'[!] ERROR: {r.status} - {await r.text()}')
            return []

        market = await r.json()
        json_offers = market['data']
        offers += [await create_offer(o) for o in json_offers]

    json_data['offerType'] = types[1]

    async with session.request('POST', url, headers=headers, json=json_data, proxy=proxy_txt, timeout=timeout) as r:
        if r.content_type != 'application/json' or r.status != 200:
            print(f'[!] ERROR: {r.status} - {await r.text()}')
            return []

        market = await r.json()
        json_offers = market['data']
        offers += [await create_offer(o) for o in json_offers]

    return offers


async def parse_markets(pair_list, auth_token, timeout=5) -> list[Offer]:
    """
    :param auth_token:
    :param pair_list: ['TON', 'RUB'] ...
    :param timeout:
    :return:
    """
    p = ProxyManager()
    offers = []

    async with aiohttp.ClientSession() as session:
        result = await gather_with_concurrency(
            p.count(),
            *[parse(pair, auth_token, session=session, timeout=timeout, proxy=p.get_next()) for pair in pair_list])
    for row in result:
        offers += row
    return offers


def activate(delay=3):
    # print('[*] Activate')
    # s: Setting = Setting.objects.all().first()
    # prev_token = s.token
    # threading.Thread(target=wallet_tx_update, daemon=True).start()
    # threading.Thread(target=token_update, daemon=True).start()
    # print('[*] Wait new token...')
    # while prev_token == s.token:
    #     s: Setting = Setting.objects.all().first()
    #     time.sleep(5)
    #     print('[*] ...')

    fiat_list = FiatCurrency.objects.all().values('name')
    crypto_list = CryptoCurrency.objects.all().values('name')

    while 1:
        try:
            s: Setting = Setting.objects.all().first()
            token = s.token

            pairs = [[i['name'], j['name']] for j in fiat_list for i in crypto_list]
            result: list[Offer] = asyncio.run(parse_markets(pairs, token, timeout=10))

            id_list = [e.id for e in result]
            existing_ids = Offer.objects.filter(id__in=id_list).values_list('id', flat=True)
            non_existing_ids = list(set(id_list) - set(existing_ids))

            existing_offer = [o for o in result if o.id in existing_ids]
            non_existing_offer = [o for o in result if o.id in non_existing_ids]

            if existing_offer:
                print(f'added new {len(existing_offer)}')
                Offer.objects.bulk_create(non_existing_offer)

            if non_existing_offer:
                print(f'update {len(non_existing_offer)}: {non_existing_offer}')
                print('111')
                # Offer.objects.bulk_update(existing_offer, ['field1']
            exit()
            # for o in result:
            #     list_of_objects.append(
            #         db_Offer(
            #             id=o.id,
            #             number=o.number,
            #             available_volume=o.availableVolume,
            #             type=o.type,
            #             price=Price(
            #                 base_currency_code=o.price.baseCurrencyCode,
            #                 quote_currency_code=o.price.quoteCurrencyCode,
            #                 type=o.price.type,
            #                 value=o.price.value,
            #             ),
            #             order_amount_limits=OrderAmountLimits(
            #                 min=o.orderAmountLimits.min,
            #                 max=o.orderAmountLimits.max,
            #                 currency_code=o.orderAmountLimits.currencyCode,
            #                 approximate=o.orderAmountLimits.approximate,
            #             ),
            #             order_volume_limits=OrderVolumeLimits(
            #                 min=o.orderVolumeLimits.min,
            #                 currency_code=o.orderVolumeLimits.currencyCode,
            #                 max=o.orderVolumeLimits.max,
            #                 approximate=o.orderAmountLimits.approximate,
            #             ),
            #             payment_methods=PaymentMethod,
            #             # user=,
            #             # add_time=,
            #         )
            #     )

            # exit()
            # for row in result:
            #     [ask, bid] = row

            # if row is None:
            #     pass
            #     row: MarketData = MarketData(
            #         bid_offers=pickle.dumps(bid_offers),
            #         ask_offers=pickle.dumps(ask_offers),
            #         crypto=CryptoCurrency.objects.filter(name=pair[0]).first(),
            #         fiat=FiatCurrency.objects.filter(name=pair[1]).first()
            #     )
            # else:
            #     row.bid_offers = pickle.dumps(bid_offers)
            #     row.ask_offers = pickle.dumps(ask_offers)
            # row.save()

            # exit()
        #
        # w = Wallet(auth_token=token)
        #     time.sleep(3)
        #     bid_offers = w.get_p2p_market('TON', 'RUB', 'SALE')
        #     time.sleep(3)
        #     ask_offers = w.get_p2p_market('TON', 'RUB', 'PURCHASE')
        #     market_price = to_fixed(w.get_rate(), 2)
        #
        #     row = MarketData.objects.first()
        #
        #     if row is None:
        #         row: models.Model = MarketData(
        #             bid_offers=pickle.dumps(bid_offers), ask_offers=pickle.dumps(ask_offers))
        #     else:
        #         row.bid_offers = pickle.dumps(bid_offers)
        #         row.ask_offers = pickle.dumps(ask_offers)
        #
        #     row.save()
        #
        #     actions_handler(bid_offers, ask_offers, market_price)
        #
        except Exception as e:
            raise
            print(f"[!] Wallet api parser loop error: {e}")
        #
        # finally:
        #     time.sleep(delay)


if __name__ == '__main__':
    activate(5)

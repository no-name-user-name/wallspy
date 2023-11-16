import asyncio
import pickle
import pprint
import threading
import time

import aiohttp
from django.db.models import QuerySet
from wallet.types import Offer

from parser.utils.my_proxy import ProxyManager, Proxy
from parser.utils.threads import wallet_tx_update, token_update
from parser.utils.utils import gather_with_concurrency
from .models import Setting, FiatCurrency, CryptoCurrency, MarketData


async def parse(pair, token, session, timeout, proxy: Proxy):
    asks = []
    bids = []

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
        asks += [Offer.from_dict(o) for o in json_offers]

    json_data['offerType'] = types[1]

    async with session.request('POST', url, headers=headers, json=json_data, proxy=proxy_txt, timeout=timeout) as r:
        if r.content_type != 'application/json' or r.status != 200:
            print(f'[!] ERROR: {r.status} - {await r.text()}')
            return []

        market = await r.json()
        json_offers = market['data']
        bids += [Offer.from_dict(o) for o in json_offers]

    return {'-'.join(pair): {
        'asks': asks,
        'bids': bids
    }}


async def parse_markets(pair_list, auth_token, timeout=5) -> dict:
    """
    :param auth_token:
    :param pair_list: ['TON', 'RUB'] ...
    :param timeout:
    :return:
    """
    p = ProxyManager()

    async with aiohttp.ClientSession() as session:
        return await gather_with_concurrency(
            p.count(),
            *[parse(pair, auth_token, session=session, timeout=timeout, proxy=p.get_next()) for pair in pair_list])


def activate(delay=5):
    print('[*] Activate')
    s: Setting = Setting.objects.all().first()
    prev_token = s.token
    threading.Thread(target=wallet_tx_update, daemon=True).start()
    threading.Thread(target=token_update, daemon=True).start()
    print('[*] Wait new token...')
    while prev_token == s.token:
        s: Setting = Setting.objects.all().first()
        time.sleep(5)
        print('[*] ...')

    fiat_list = FiatCurrency.objects.all().values('name')
    crypto_list = CryptoCurrency.objects.all().values('name')

    while 1:
        try:
            s: Setting = Setting.objects.all().first()
            token = s.token

            t = time.time()
            pairs = [[i['name'], j['name']] for j in fiat_list for i in crypto_list]
            result = asyncio.run(parse_markets(pairs, token, timeout=10))
            print(f'[!] Parse spend time: {time.time() - t} seconds')

            t = time.time()
            for each in result:
                for pair in each:
                    crypto: str = pair.split('-')[0]
                    fiat: str = pair.split('-')[1]
                    # print(fiat, crypto)

                    obj, created = MarketData.objects.update_or_create(
                        fiat=FiatCurrency.objects.filter(name=fiat).first(),
                        crypto=CryptoCurrency.objects.filter(name=crypto).first(),
                        defaults={
                            'bid_offers': pickle.dumps(each[pair]['bids']),
                            'ask_offers': pickle.dumps(each[pair]['asks'])
                        }
                    )

            print(f'[!] Update spend time: {time.time() - t} seconds')

        except Exception as e:
            # raise
            print(f"[!] Wallet api parser loop error: {e}")
        #
        finally:
            print(f'\ndelay {delay}sec')
            print('====================')
            time.sleep(delay)


if __name__ == '__main__':
    activate(5)

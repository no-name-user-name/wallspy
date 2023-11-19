import asyncio
import pickle
import pprint
import threading
import time

import aiohttp
from asgiref.sync import sync_to_async
from django.db.models import QuerySet
from wallet.types import Offer

from parser.utils.my_proxy import ProxyManager, Proxy
from parser.utils.threads import wallet_tx_update, token_update
from parser.utils.utils import gather_with_concurrency, get_diffs
from .models import Setting, FiatCurrency, CryptoCurrency, MarketData, NewAction, User, Statistic


async def parse(pair, token, session, timeout, proxy: Proxy):
    asks = []
    bids = []

    crypto: str = pair[0]
    fiat: str = pair[1]

    endpoint = 'https://walletbot.me'
    types = ['SALE', 'PURCHASE']
    json_data = {
        "baseCurrencyCode": crypto,
        "quoteCurrencyCode": fiat,
        "offerType": types[0],
        "offset": 0,
        "limit": 30,
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
        for o in json_offers:
            o['price']['value'] = float("{:.4f}".format(float(o['price']['value'])))

        asks += [Offer.from_dict(o) for o in json_offers]

    json_data['offerType'] = types[1]

    async with session.request('POST', url, headers=headers, json=json_data, proxy=proxy_txt, timeout=timeout) as r:
        if r.content_type != 'application/json' or r.status != 200:
            print(f'[!] ERROR: {r.status} - {await r.text()}')
            return []

        market = await r.json()
        json_offers = market['data']
        for o in json_offers:
            o['price']['value'] = float("{:.4f}".format(float(o['price']['value'])))

        bids += [Offer.from_dict(o) for o in json_offers]

    await market_upd(fiat, crypto, asks, bids)


prev_market = {}
users: QuerySet[User] = None


def get_update_list(curr: list[dict], prev: list[dict]):
    for cb in curr:
        search = [pb for pb in prev if pb['id'] == cb['id']]
        if search:
            diffs = get_diffs(cb, search[0])

            if "user" in diffs:
                if diffs["user"][0]['nickname'] != diffs["user"][0]['nickname']:
                    print('[*] nickname')
                    NewAction(
                        order=pickle.dumps(cb),
                        changes=pickle.dumps(diffs),
                        action_type='nickname',
                        timestamp=int(time.time()),
                    ).save()

                elif diffs["user"][0]['isVerified'] != diffs["user"][0]['isVerified']:
                    print('[*] isVerified')
                    NewAction(
                        order=pickle.dumps(cb),
                        changes=pickle.dumps(diffs),
                        action_type='isVerified',
                        timestamp=int(time.time()),
                    ).save()

                elif diffs["user"][0]['statistics']['totalOrdersCount'] != diffs["user"][0]['statistics'][
                    'totalOrdersCount']:
                    print('[*] totalOrdersCount')
                    NewAction(
                        order=pickle.dumps(cb),
                        changes=pickle.dumps(diffs),
                        action_type='totalOrdersCount',
                        timestamp=int(time.time()),
                    ).save()

            elif "availableVolume" in diffs:
                print('[*] availableVolume')
                NewAction(
                    order=pickle.dumps(cb),
                    changes=pickle.dumps(diffs),
                    action_type='availableVolume',
                    timestamp=int(time.time()),
                ).save()

            elif 'orderVolumeLimits' in diffs:
                if diffs['orderVolumeLimits'][0]['max'] != diffs['orderVolumeLimits'][0]['max']:
                    print('[*] orderVolumeLimits')
                    NewAction(
                        order=pickle.dumps(cb),
                        changes=pickle.dumps(diffs),
                        action_type='orderVolumeLimits',
                        timestamp=int(time.time()),
                    ).save()

        else:
            print('[*] new')
            NewAction(
                order=pickle.dumps(cb),
                action_type='new',
                timestamp=int(time.time()),
            ).save()

    for pb in prev:
        search = [cb for cb in curr if cb['id'] == pb['id']]
        if not search:
            print('[*] delete')
            NewAction(
                order=pickle.dumps(pb),
                action_type='delete',
                timestamp=int(time.time()),
            ).save()


@sync_to_async
def market_upd(fiat, crypto, asks: list[Offer], bids: list[Offer]):
    global prev_market, users
    MarketData.objects.update_or_create(
        fiat=FiatCurrency.objects.filter(name=fiat).first(),
        crypto=CryptoCurrency.objects.filter(name=crypto).first(),
        defaults={
            'bid_offers': pickle.dumps(bids),
            'ask_offers': pickle.dumps(asks)
        }
    )

    for o in asks + bids:
        ou = o.user

        u = users.filter(user_id=ou.userId).first()

        if u:
            is_save = False
            if u.nickname != ou.nickname:
                u.nickname = ou.nickname
                is_save = True

            if u.is_verified != ou.isVerified:
                u.is_verified = ou.isVerified
                is_save = True

            stats: Statistic = u.statistics
            if not stats or stats.total_orders_count != ou.statistics.totalOrdersCount:
                new_stats = Statistic(
                    user_id=ou.userId,
                    total_orders_count=ou.statistics.totalOrdersCount,
                    success_percent=ou.statistics.successPercent,
                    success_rate=ou.statistics.successRate,
                    timestamp=int(time.time())
                )
                new_stats.save()
                u.statistics = new_stats
                is_save = True

            if is_save:
                u.last_activity = int(time.time())
                u.save()
                print('[*] User updated')

        else:
            u = User.objects.filter(user_id=ou.userId).first()
            if not u:
                new_stats = Statistic(
                    user_id=ou.userId,
                    total_orders_count=ou.statistics.totalOrdersCount,
                    success_percent=ou.statistics.successPercent,
                    success_rate=ou.statistics.successRate,
                    timestamp=int(time.time())
                )
                new_stats.save()
                User(
                    user_id=ou.userId,
                    nickname=ou.nickname,
                    avatar_code=ou.avatarCode,
                    is_verified=ou.isVerified,
                    last_activity=int(time.time()),
                    statistics=new_stats,
                ).save()
                print('[+] New user')

    content = {
        'asks': [o.to_dict() for o in asks],
        'bids': [o.to_dict() for o in bids],
    }

    pair = f'{crypto}-{asks}'
    if pair not in prev_market:
        prev_market[pair] = content
        return

    get_update_list(content['bids'], prev_market[pair]['bids'])
    get_update_list(content['asks'], prev_market[pair]['asks'])

    prev_market[pair] = content


async def parse_markets(pair_list, auth_token, timeout=5):
    """
    :param auth_token:
    :param pair_list: ['TON', 'RUB'] ...
    :param timeout:
    :return:
    """
    p = ProxyManager()

    async with aiohttp.ClientSession() as session:
        await gather_with_concurrency(
            p.count(),
            *[parse(pair, auth_token, session=session, timeout=timeout, proxy=p.get_next()) for pair in pair_list])


def activate(delay=2):
    global users

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
            users = User.objects.all()

            s: Setting = Setting.objects.all().first()
            token = s.token

            t = time.time()
            pairs = [[i['name'], j['name']] for j in fiat_list for i in crypto_list]
            asyncio.run(parse_markets(pairs, token, timeout=10))
            print(f'[!] Parse spend time: {time.time() - t} seconds')
        except Exception as e:
            # raise
            print(f"[!] Wallet api parser loop error: {e}")
        #
        finally:
            print(f'\ndelay {delay}sec')
            time.sleep(delay)


if __name__ == '__main__':
    activate(delay=2)

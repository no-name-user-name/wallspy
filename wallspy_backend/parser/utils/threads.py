import time

import requests
from wallet import Client

from parser.models import Setting, Balance, WalletTransaction


def token_update(delay=60 * 10):
    while 1:
        try:
            # for new telegram connection
            # client = Client.auth('main')

            # for old tg connection
            client = Client(headless=True)
            token = client.get_token()
            client.driver.quit()

            s: Setting = Setting.objects.all().first()
            if not s:
                s = Setting(token=token)
            else:
                s.token = token
            s.save()

            time.sleep(delay)
        except Exception as e:
            print(f"[!] Token_update error: {e}")
            time.sleep(10)


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

            if i > 0:
                print(f'[*] Saved {i} new txs')

        except Exception as e:
            print(f"[!] Tonscan loop error: {e}")

        finally:
            time.sleep(5)

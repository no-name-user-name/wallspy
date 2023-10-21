import datetime
import pickle
import time
from datetime import date, timedelta

from django.http import JsonResponse
from parser.models import MarketAction, WalletTransaction, MarketData, Balance
from parser.serializers import MarketActionSerializer
from parser.utils import obj_to_dict
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from wallet.types import Offer


class MarketActionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MarketAction.objects.all()
    serializer_class = MarketActionSerializer

    def get_queryset(self):
        queryset = self.queryset
        if self.request.query_params.get('after'):
            timestamp = int(self.request.query_params.get('after'))
            queryset = queryset.filter(timestamp__gte=timestamp)

        return queryset[:100]


# activity data for graphs {time:timestamp, value: num} format
@api_view(['GET'])
def export_activity(request):
    stamp = request.GET.get("after")
    out = {'data': []}

    if stamp:
        data: [MarketAction] = MarketAction.objects.filter(timestamp__gte=stamp)
        txs: [WalletTransaction] = WalletTransaction.objects.filter(timestamp__gte=stamp)

        rows = []
        rows.extend(data.values_list('timestamp', flat=True))
        rows.extend(txs.values_list('timestamp', flat=True))
        rows.sort()

        prev_time = 0
        counter = 0
        period = 60 * 5
        result = []
        next_time = 0

        for s in rows:
            div = s % period
            next_time = s - div

            if prev_time != next_time:
                if prev_time != 0:
                    result.append({'time': next_time, 'value': counter})
                prev_time = next_time
                counter = 1
            else:
                counter += 1

        if next_time == prev_time and next_time != 0:
            result.append({'time': next_time + period, 'value': counter})
        out = {'data': result}
    return JsonResponse(out)


def export_month_transactions(request):
    period = request.GET.get("period")

    if period and period == '30d':

        days_before = (datetime.date.today() - timedelta(days=30)).timetuple()
        timestamp = int(time.mktime(days_before))
        txs: [WalletTransaction] = WalletTransaction.objects.filter(timestamp__gte=timestamp)
        balances: [Balance] = Balance.objects.filter(timestamp__gte=timestamp)

        daily_balance = {}
        daily_income = {}
        daily_outcome = {}

        for b in balances:
            timestamp = b.timestamp
            value = int(b.value)

            _date = timestamp - (timestamp % (60 * 60))
            # _date = datetime.datetime.fromtimestamp(timestamp).date()

            if _date not in daily_income:
                daily_balance[_date] = 0
            daily_balance[_date] += value

        for tx in txs:
            timestamp = tx.timestamp
            is_income = tx.is_income
            value = int(tx.value)
            _date = datetime.datetime.fromtimestamp(timestamp).date()
            if is_income:
                if _date not in daily_income:
                    daily_income[_date] = 0
                daily_income[_date] += value

            else:
                if _date not in daily_outcome:
                    daily_outcome[_date] = 0
                daily_outcome[_date] += value

        out = {
            'data': {
                'income': [
                    {'value': daily_income[d], 'time': d} for d in daily_income],
                'outcome': [
                    {'value': daily_outcome[d], 'time': d} for d in daily_outcome],
                'balance': [
                    {'value': daily_balance[d], 'time': d} for d in daily_balance
                ]
            }
        }
        return JsonResponse(out)


@api_view(['GET'])
def get_last_actions(request):
    rows = MarketAction.objects.order_by('-id')[:10]

    actions = [{
        "id": row.id,
        "order_id": row.order_id,
        "action_type": row.action_type,
        "user_id": row.user_id,
        "user_name": row.user_name,
        "user_avatar_code": row.user_avatar_code,
        "old_price": row.old_price,
        "new_price": row.new_price,
        "offer_type": row.offer_type,
        "old_volume": row.old_volume,
        "new_volume": row.new_volume,
        "timestamp": row.timestamp,
    } for row in rows]

    out = {'type': 'last_actions', 'actions': actions}

    return JsonResponse(out)


@api_view(['GET'])
def export_activity_stats(request):
    now = int(time.mktime(datetime.datetime.now().date().timetuple()))
    data: [MarketAction] = list(MarketAction.objects.filter(timestamp__gte=now))
    txs: [WalletTransaction] = list(WalletTransaction.objects.filter(timestamp__gte=now))
    count24h = len(data) + len(txs)

    income_txs = [int(tx.value) for tx in txs if tx.is_income]
    outcome_txs = [int(tx.value) for tx in txs if not tx.is_income]

    out = {'data': {
        'count24h': count24h,
        'txs': {
            'income_count': len(income_txs),
            'outcome_count': len(outcome_txs),
        },
        'balance': {
            'income': sum(income_txs),
            'outcome': sum(outcome_txs),
        }
    }}

    return JsonResponse(out)


@api_view(['GET'])
def export_market_offers(request):
    row = MarketData.objects.first()

    bid_offers: [Offer] = pickle.loads(row.bid_offers)
    ask_offers: [Offer] = pickle.loads(row.ask_offers)

    content = {
        'asks': [obj_to_dict(a) for a in ask_offers],
        'bids': [obj_to_dict(b) for b in bid_offers]
    }

    return Response(content)

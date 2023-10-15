import datetime
import json
import pickle
import time

from django.db.models import QuerySet
from django.http import JsonResponse
from rest_framework import viewsets

from parser.models import MarketData
from parser.models import MarketAction
from parser.serializers import MarketActionSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from wallet.types import Offer

from parser.utils import obj_to_dict


class MarketActionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MarketAction.objects.all()
    serializer_class = MarketActionSerializer

    def get_queryset(self):
        queryset = self.queryset
        if self.request.query_params.get('after'):
            timestamp = int(self.request.query_params.get('after'))
            queryset = queryset.filter(timestamp__gte=timestamp)

        return queryset[:100]


@api_view(['GET'])
def export_activity_stats(request):
    stamp = request.GET.get("after")
    out = {'data': []}

    if stamp:
        data: [MarketAction] = list(MarketAction.objects.all().filter(timestamp__gte=stamp))
        rows = [each.timestamp for each in data]

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

import datetime
import json
import pickle

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

        return queryset


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

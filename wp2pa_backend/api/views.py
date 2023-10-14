import datetime
import pickle

from rest_framework import viewsets

from parser.models import MarketData
from parser.models import MarketAction
from parser.serializers import MarketActionSerializer
from rest_framework.response import Response



# Create your views here.
class MarketActionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MarketAction.objects.all()
    serializer_class = MarketActionSerializer

    def get_queryset(self):
        queryset = self.queryset
        if self.request.query_params.get('after'):
            timestamp = int(self.request.query_params.get('after'))
            queryset = queryset.filter(timestamp__gte=timestamp)

        return queryset

def export_market_offers(request):

    row = MarketData.objects.first()
    print(row.bid_offers)
    bid_offers = pickle.loads(row.bid_offers, fix_imports=True)
    # ask_offers = pickle.loads(row.ask_offers, encoding='utf-8')

    print(bid_offers)



    content = {
        'status': 1
    }
    return Response(content)
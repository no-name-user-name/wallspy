from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MarketActionViewSet, export_market_offers, export_activity, export_activity_stats, get_last_actions, \
    export_month_transactions


api_version = 'v1'

# router = DefaultRouter()
# router.register('actions', MarketActionViewSet, basename='actions')

urlpatterns = [
    # path(f'{api_version}/market/offers', export_market_offers),
    # path(f'{api_version}/market/', include(router.urls)),
    path(f'{api_version}/market/actions/', export_activity),
    path(f'{api_version}/market/actions/last/', get_last_actions),
    path(f'{api_version}/market/actions/stats/', export_activity_stats),
    path(f'{api_version}/txs/', export_month_transactions),
]

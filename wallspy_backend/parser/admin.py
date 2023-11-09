from django.contrib import admin

from parser.models import Setting, FiatCurrency, MarketData, CryptoCurrency, User, Offer


class SettingTable(admin.ModelAdmin):
    list_display = ('id', 'token')


class FiatCurrencyTable(admin.ModelAdmin):
    list_display = ('id', 'name')


class MarketDataTable(admin.ModelAdmin):
    list_display = ('id', 'fiat', 'crypto')


class CryptoCurrencyTable(admin.ModelAdmin):
    list_display = ('id', 'name')


# class UserTable(admin.ModelAdmin):
#     list_display = ('id', 'user_id', 'nickname', 'avatar_code', 'is_verified', 'last_activity', 'statistic',)
#
#
class OfferTable(admin.ModelAdmin):
    list_display = ('id', 'number', 'available_volume', 'type', 'price', 'order_amount_limit', 'order_volume_limit',
                    'user',)


admin.site.register(Offer, OfferTable)
admin.site.register(CryptoCurrency, CryptoCurrencyTable)
admin.site.register(MarketData, MarketDataTable)
admin.site.register(Setting, SettingTable)
admin.site.register(FiatCurrency, FiatCurrencyTable)
# admin.site.register(User, UserTable)

from django.contrib import admin

from parser.models import Setting, FiatCurrency, MarketData, CryptoCurrency, NewAction, User


class SettingTable(admin.ModelAdmin):
    list_display = ('id', 'token')


class FiatCurrencyTable(admin.ModelAdmin):
    list_display = ('id', 'name')


class MarketDataTable(admin.ModelAdmin):
    list_display = ('id', 'fiat', 'crypto')


class CryptoCurrencyTable(admin.ModelAdmin):
    list_display = ('id', 'name')


class UserTable(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'nickname', 'avatar_code', 'is_verified', 'last_activity')


class NewActionTable(admin.ModelAdmin):
    list_display = ('id', 'action_type',)


admin.site.register(NewAction, NewActionTable)
admin.site.register(CryptoCurrency, CryptoCurrencyTable)
admin.site.register(MarketData, MarketDataTable)
admin.site.register(Setting, SettingTable)
admin.site.register(FiatCurrency, FiatCurrencyTable)
admin.site.register(User, UserTable)

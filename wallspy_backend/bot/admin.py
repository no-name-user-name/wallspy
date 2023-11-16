from django.contrib import admin

from bot.models import TelegramUser, Setting


class TelegramUserTable(admin.ModelAdmin):
    list_display = (
        'id', 'username', 'password', 'first_name', 'last_name', 'tg_id', 'is_premium', 'language_code', 'photo_url',
        'allows_write_to_pm', 'status',)


class SettingTable(admin.ModelAdmin):
    list_display = ('bot_token', 'group_id')


admin.site.register(TelegramUser, TelegramUserTable)
admin.site.register(Setting, SettingTable)

from django.contrib.auth.models import AbstractUser
from django.db import models


class TelegramUser(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=200, unique=True, blank=True, null=True)
    password = models.CharField(max_length=200, blank=True, null=True)
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200, blank=True, null=True)
    tg_id = models.IntegerField(default=0)
    is_premium = models.BooleanField(default=False, null=True)
    language_code = models.CharField(max_length=10, default='ru')
    photo_url = models.TextField(blank=True, null=True)
    allows_write_to_pm = models.BooleanField(default=True)
    status = models.IntegerField(default=1)

    def __str__(self):
        return str(self.tg_id)


class Setting(models.Model):
    id = models.AutoField(primary_key=True)
    bot_token = models.CharField(max_length=100)
    group_id = models.CharField(max_length=100, null=True)

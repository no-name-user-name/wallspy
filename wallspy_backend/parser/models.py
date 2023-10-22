import time

from django.db import models
from django.utils.timezone import now


class MarketData(models.Model):
    id = models.AutoField(primary_key=True)
    bid_offers = models.BinaryField()
    ask_offers = models.BinaryField()


class MarketAction(models.Model):
    id = models.AutoField(primary_key=True)
    order_id = models.IntegerField()
    action_type = models.TextField()
    user_id = models.IntegerField()
    user_name = models.TextField()
    user_avatar_code = models.TextField()
    old_price = models.FloatField(null=True)
    new_price = models.FloatField(null=True)
    offer_type = models.TextField(null=True)
    old_volume = models.FloatField(null=True)
    new_volume = models.FloatField(null=True)
    timestamp = models.IntegerField()


class WalletTransaction(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.TextField()
    source = models.TextField()
    destination = models.TextField()
    is_income = models.BooleanField(default=True)
    hash = models.TextField()
    timestamp = models.IntegerField()
    value = models.TextField()


class Balance(models.Model):
    id = models.AutoField(primary_key=True)
    value = models.IntegerField()
    timestamp = models.IntegerField()


class User(models.Model):
    id = models.AutoField(primary_key=True)
    nickname = models.CharField(max_length=300)
    avatar_code = models.CharField(max_length=300)
    user_id = models.IntegerField()
    last_activity = models.IntegerField(default=0)
    is_verified = models.BooleanField()


class UserStat(models.Model):
    id = models.AutoField(primary_key=True)
    total_orders_count = models.IntegerField()
    success_percent = models.IntegerField()
    user_id = models.IntegerField()
    success_rate = models.CharField(max_length=100)
    timestamp = models.IntegerField(default=0)


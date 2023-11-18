import time
from parser.utils.utils import timestamp
from django.db import models


class CryptoCurrency(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=5)

    def __str__(self):
        return f"{self.name}"


class FiatCurrency(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=5)

    def __str__(self):
        return f"{self.name}"


class MarketData(models.Model):
    id = models.AutoField(primary_key=True)
    bid_offers = models.BinaryField()
    ask_offers = models.BinaryField()
    fiat = models.ForeignKey(FiatCurrency, related_name='fiat', on_delete=models.CASCADE, null=True)
    crypto = models.ForeignKey(CryptoCurrency, related_name='crypto', on_delete=models.CASCADE, null=True)


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


class NewAction(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.BinaryField()
    changes = models.BinaryField(null=True)
    action_type = models.TextField(null=True)
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


class Setting(models.Model):
    id = models.AutoField(primary_key=True)
    token = models.CharField(max_length=100)


class Statistic(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    total_orders_count = models.IntegerField()
    success_percent = models.FloatField()
    success_rate = models.CharField(max_length=100)
    timestamp = models.IntegerField(default=timestamp)

    def __str__(self):
        return f"{self.total_orders_count} ({self.success_percent})"


class User(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    nickname = models.CharField(max_length=100)
    avatar_code = models.CharField(max_length=100)
    is_verified = models.BooleanField()
    last_activity = models.IntegerField(default=0)
    statistics = models.ForeignKey(Statistic, related_name='statistics', on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f"{self.nickname} ({self.user_id})"

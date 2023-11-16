import time

from django.db import models
from django.utils.timezone import now


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


# class User(models.Model):
#     id = models.AutoField(primary_key=True)
#     nickname = models.CharField(max_length=300)
#     avatar_code = models.CharField(max_length=300)
#     user_id = models.IntegerField()
#     last_activity = models.IntegerField(default=0)
#     is_verified = models.BooleanField()


class UserStat(models.Model):
    id = models.AutoField(primary_key=True)
    total_orders_count = models.IntegerField()
    success_percent = models.IntegerField()
    user_id = models.IntegerField()
    success_rate = models.CharField(max_length=100)
    timestamp = models.IntegerField(default=0)


class Setting(models.Model):
    id = models.AutoField(primary_key=True)
    token = models.CharField(max_length=100)


# ===========================

class Price(models.Model):
    id = models.AutoField(primary_key=True)
    base_currency_code = models.CharField(max_length=100)
    quote_currency_code = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    value = models.FloatField()

    def __str__(self):
        return f"{self.value}{self.quote_currency_code} {self.type} {self.base_currency_code}"


class PaymentMethod(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    name_eng = models.CharField(max_length=100)
    code = models.CharField(max_length=100)
    origin_name_locale = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.code})"


class OrderVolumeLimit(models.Model):
    id = models.AutoField(primary_key=True)
    min = models.FloatField()
    currency_code = models.CharField(max_length=100)
    max = models.FloatField()
    approximate = models.BooleanField()

    def __str__(self):
        return f"{self.min}-{self.max}{self.currency_code}"


class OrderAmountLimit(models.Model):
    id = models.AutoField(primary_key=True)
    min = models.FloatField()
    max = models.FloatField()
    currency_code = models.CharField(max_length=100)
    approximate = models.BooleanField()

    def __str__(self):
        return f"{self.min}-{self.max}{self.currency_code}"


class Statistic(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    total_orders_count = models.IntegerField()
    success_percent = models.FloatField()
    success_rate = models.CharField(max_length=100)

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


class Offer(models.Model):
    id = models.IntegerField(primary_key=True)
    number = models.CharField(max_length=100, null=True)
    available_volume = models.FloatField(null=True)
    type = models.CharField(max_length=100, null=True)
    price = models.ForeignKey(Price, related_name='price', on_delete=models.CASCADE, null=True)
    order_amount_limit = models.ForeignKey(OrderAmountLimit, related_name="order_amount_limit",
                                           on_delete=models.CASCADE, null=True)
    order_volume_limit = models.ForeignKey(OrderVolumeLimit, related_name="order_volume_limit",
                                           on_delete=models.CASCADE, null=True)
    payment_method = models.ManyToManyField(PaymentMethod, related_name="payment_method")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user", null=True)
    is_active = models.BooleanField(default=True)
    add_time = models.DateTimeField(auto_now=True)




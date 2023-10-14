import time

from django.db import models
from django.utils.timezone import now


#
#
# class Wallet(models.Model):
#     id = models.AutoField(primary_key=True)
#     user_id = models.IntegerField()
#     network = models.CharField(max_length=200)
#     address = models.CharField(max_length=200)
#     private_key = models.TextField()
#     add_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
#     status = models.IntegerField()
#
#     def __str__(self):
#         return self.address


class MarketData(models.Model):
    id = models.AutoField(primary_key=True)
    bid_offers = models.TextField()
    ask_offers = models.TextField()


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
    timestamp = models.IntegerField(default=int(time.time()))

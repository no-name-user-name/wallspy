from rest_framework import serializers
from .models import MarketAction, Offer, Price, OrderAmountLimit, OrderVolumeLimit, PaymentMethod, User, Statistic


class MarketActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketAction
        fields = '__all__'


class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        exclude = ('id',)


class OrderAmountLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderAmountLimit
        exclude = ('id',)


class OrderVolumeLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderVolumeLimit
        exclude = ('id',)


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        exclude = ('id',)


class StatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statistic
        exclude = ('id',)


class UserSerializer(serializers.ModelSerializer):
    statistics = StatisticSerializer()

    class Meta:
        model = User
        exclude = ('id',)


class OfferSerializer(serializers.ModelSerializer):
    price = PriceSerializer()
    order_amount_limit = OrderAmountLimitSerializer()
    order_volume_limit = OrderVolumeLimitSerializer()
    payment_method = PaymentMethodSerializer(many=True)
    user = UserSerializer()

    class Meta:
        model = Offer
        fields = '__all__'

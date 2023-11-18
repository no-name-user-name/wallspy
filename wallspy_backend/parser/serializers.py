from rest_framework import serializers
from .models import MarketAction, Statistic, User


class MarketActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketAction
        fields = '__all__'

class StatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statistic
        exclude = ('id',)


class UserSerializer(serializers.ModelSerializer):
    statistics = StatisticSerializer()

    class Meta:
        model = User
        exclude = ('id',)

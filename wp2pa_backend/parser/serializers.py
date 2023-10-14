from rest_framework import serializers
from .models import MarketAction


class MarketActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketAction
        fields = '__all__'

from rest_framework import serializers
from .models import Place, Route, RoutePlace

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ['id', 'name', 'latitude', 'longitude', 'state', 'address', 'geocoded_at']

class RoutePlaceSerializer(serializers.ModelSerializer):
    place = PlaceSerializer()

    class Meta:
        model = RoutePlace
        fields = ['order', 'place']

class RouteSerializer(serializers.ModelSerializer):
    places = RoutePlaceSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = ['id', 'created_at', 'total_distance', 'places']

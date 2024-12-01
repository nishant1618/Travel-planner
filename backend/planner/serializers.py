from rest_framework import serializers
from .models import Place, Route, RoutePlace

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ['id', 'name', 'latitude', 'longitude', 'state']

class RouteSerializer(serializers.ModelSerializer):
    places = serializers.SerializerMethodField()
    
    class Meta:
        model = Route
        fields = ['id', 'created_at', 'total_distance', 'places']
    
    def get_places(self, obj):
        route_places = RoutePlace.objects.filter(route=obj).order_by('order')
        return PlaceSerializer([rp.place for rp in route_places], many=True).data

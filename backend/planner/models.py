# Create your models here.
from django.db import models

class Place(models.Model):
    name = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    state = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Route(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    total_distance = models.FloatField()
    
    def __str__(self):
        return f"Route {self.id} - {self.total_distance}km"

class RoutePlace(models.Model):
    route = models.ForeignKey(Route, related_name='places', on_delete=models.CASCADE)
    place = models.ForeignKey(Place, on_delete=models.CASCADE)
    order = models.IntegerField()
    
    class Meta:
        ordering = ['order']

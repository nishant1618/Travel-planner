from django.db import models
from django.utils import timezone

class Place(models.Model):
    name = models.CharField(max_length=200)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    state = models.CharField(max_length=100)
    address = models.TextField(null=True, blank=True)
    geocoded_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.geocoded_at:
            self.geocoded_at = timezone.now()
        super().save(*args, **kwargs)
    
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
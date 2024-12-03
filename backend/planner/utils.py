import requests
from math import radians, sin, cos, sqrt, atan2
from django.conf import settings

from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points in kilometers."""
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

def get_distance_matrix(origin, destination):
    """Get driving distance between two points using OpenRouteService API."""
    url = "https://api.openrouteservice.org/v2/matrix/driving-car"
    headers = {
        'Authorization': settings.OPENROUTE_API_KEY,
        'Content-Type': 'application/json'
    }
    
    body = {
        "locations": [
            [origin.longitude, origin.latitude],
            [destination.longitude, destination.latitude]
        ],
        "metrics": ["distance"],
        "units": "km"
    }
    
    try:
        response = requests.post(url, json=body, headers=headers)
        if response.status_code == 200:
            data = response.json()
            return data['distances'][0][1]
        return haversine_distance(origin.latitude, origin.longitude, 
                                destination.latitude, destination.longitude)
    except:
        # Fallback to haversine distance if API fails
        return haversine_distance(origin.latitude, origin.longitude, 
                                destination.latitude, destination.longitude)

def find_shortest_path(places):
    """Implementation of A* algorithm for finding shortest path between multiple places."""
    if len(places) <= 2:
        return places, sum(get_distance_matrix(places[i], places[i+1]) 
                         for i in range(len(places)-1))
    
    # Initialize data structures
    start = places[0]
    unvisited = places[1:]
    path = [start]
    total_distance = 0
    
    while unvisited:
        current = path[-1]
        min_distance = float('inf')
        next_place = None
        
        # Find the nearest unvisited place
        for place in unvisited:
            distance = get_distance_matrix(current, place)
            if distance < min_distance:
                min_distance = distance
                next_place = place
        
        path.append(next_place)
        unvisited.remove(next_place)
        total_distance += min_distance
    
    return path, total_distance
def test_geopy_geocoding(place_name, state='Odisha'):
    try:
        geolocator = Nominatim(user_agent="travel_planner_app")
        location = geolocator.geocode(f"{place_name}, {state}, India")
        
        if location:
            print(f"Successful Geocoding:")
            print(f"Place: {place_name}")
            print(f"Latitude: {location.latitude}")
            print(f"Longitude: {location.longitude}")
            print(f"Raw Address: {location.address}")
            return location
        else:
            print(f"Geocoding failed for {place_name}")
            return None
    
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        print(f"Geocoding Error: {str(e)}")
        return None
import { useEffect, useRef } from 'react';

const MapComponent = ({ places = [], path = [] }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersLayerRef = useRef(null);
    const pathLayerRef = useRef(null);

    useEffect(() => {
        // Import Leaflet dynamically since it requires window object
        const L = require('leaflet');

        // Initialize map if it doesn't exist
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([20.5937, 78.9629], 7);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapInstance.current);

            markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
            pathLayerRef.current = L.layerGroup().addTo(mapInstance.current);
        }

        // Clear existing markers and path
        if (markersLayerRef.current) {
            markersLayerRef.current.clearLayers();
        }
        if (pathLayerRef.current) {
            pathLayerRef.current.clearLayers();
        }

        // Add markers for selected places
        places.forEach((place, index) => {
            const marker = L.marker([place.latitude, place.longitude])
                .bindPopup(`${index + 1}. ${place.name}`)
                .addTo(markersLayerRef.current);
        });

        // Draw path if available
        if (path && path.length > 1) {
            const pathCoordinates = path.map(place => [place.latitude, place.longitude]);
            L.polyline(pathCoordinates, {
                color: 'red',
                weight: 3,
                opacity: 0.7
            }).addTo(pathLayerRef.current);

            // Fit map bounds to show all markers and path
            mapInstance.current.fitBounds(pathCoordinates);
        } else if (places.length > 0) {
            // Fit map bounds to show all selected places
            const bounds = L.latLngBounds(places.map(place => [place.latitude, place.longitude]));
            mapInstance.current.fitBounds(bounds);
        }
    }, [places, path]);

    return <div ref={mapRef} className="w-full h-[500px] rounded-lg" />;
};

export default MapComponent;

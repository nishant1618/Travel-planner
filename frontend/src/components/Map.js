import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = ({ places = [], path = [] }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersLayerRef = useRef(null);
    const routingLayerRef = useRef(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        
        const L = require('leaflet');
        require('leaflet-routing-machine');
        require('leaflet/dist/leaflet.css');
        require('leaflet-routing-machine/dist/leaflet-routing-machine.css');

        const customIcon = L.divIcon({
            className: 'custom-marker-icon',
            html: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                     width="40" height="40" fill="#ef4444" stroke="#ffffff" 
                     stroke-width="2" class="drop-shadow">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        if (!mapInstance.current && mapRef.current) {
            mapInstance.current = L.map(mapRef.current, {
                zoomControl: true,
                attributionControl: true,
                preferCanvas: true
            }).setView([20.5937, 78.9629], 5);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
                minZoom: 3
            }).addTo(mapInstance.current);

            markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
            routingLayerRef.current = L.layerGroup().addTo(mapInstance.current);
        }

        if (markersLayerRef.current) markersLayerRef.current.clearLayers();
        if (routingLayerRef.current) routingLayerRef.current.clearLayers();

        places.forEach((place, index) => {
            L.marker([place.latitude, place.longitude], {
                title: place.name,
                icon: customIcon
            })
            .bindPopup(`${index + 1}. ${place.name}`)
            .addTo(markersLayerRef.current);
        });

        if (path && path.length > 1) {
            const waypoints = path.map(place => 
                L.latLng(place.latitude, place.longitude)
            );

            L.Routing.control({
                waypoints: waypoints,
                routeWhileDragging: false,
                show: true,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                lineOptions: {
                    styles: [{ color: 'red', opacity: 0.8, weight: 5 }]
                },
                createMarker: function() { return null; }
            }).addTo(mapInstance.current);

            const bounds = L.latLngBounds(waypoints);
            mapInstance.current.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 10
            });
        } else if (places.length > 0) {
            const bounds = L.latLngBounds(places.map(place => 
                [place.latitude, place.longitude]
            ));
            mapInstance.current.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 10
            });
        }

        const handleResize = () => {
            if (mapInstance.current) {
                mapInstance.current.invalidateSize();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [places, path, isClient]);

    if (!isClient) return null;

    return (
        <div
            ref={mapRef}
            className="w-full h-[500px] md:h-[700px] lg:h-[800px] rounded-lg shadow-md"
        />
    );
};

export default dynamic(() => Promise.resolve(MapComponent), {
    ssr: false
});
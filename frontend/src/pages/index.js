import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const MapComponent = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => <div className="w-full h-[500px] bg-gray-100 rounded-lg animate-pulse" />
});

export default function Home() {
    const [availablePlaces, setAvailablePlaces] = useState([
        'Bhubaneswar', 'Puri', 'Cuttack', 'Rourkela', 'Berhampur', 
        'Sambalpur', 'Balasore', 'Baripada', 'Jeypore', 'Koraput'
    ]);
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [placesWithCoordinates, setPlacesWithCoordinates] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    
    const fetchCoordinates = async (placeName) => {
        try {
            const response = await fetch(`http://localhost:8000/api/places/geocode/?place=${encodeURIComponent(placeName)}&state=Odisha`);
            if (!response.ok) {
                throw new Error('Failed to fetch coordinates');
            }
            return await response.json();
        } catch (error) {
            console.error('Geocoding error:', error);
            setError('Failed to fetch place coordinates');
            return null;
        }
    };
    
    const handlePlaceSelect = async (placeName, dropdownIndex) => {
        if (!placeName) return;

        const placeData = await fetchCoordinates(placeName);
        
        if (placeData) {
            const newPlace = {
                name: placeData.name,
                latitude: placeData.latitude,
                longitude: placeData.longitude,
                state: placeData.state
            };

            const updatedPlacesWithCoordinates = [...placesWithCoordinates];
            updatedPlacesWithCoordinates[dropdownIndex] = newPlace;
            setPlacesWithCoordinates(updatedPlacesWithCoordinates);

            const updatedSelectedPlaces = [...selectedPlaces];
            updatedSelectedPlaces[dropdownIndex] = placeName;
            setSelectedPlaces(updatedSelectedPlaces);

            // Remove selected place from available places
            setAvailablePlaces(availablePlaces.filter(place => place !== placeName));
        }
    };
    
    const addPlaceInput = () => {
        if (placesWithCoordinates.length < 6) {
            setPlacesWithCoordinates([...placesWithCoordinates, null]);
            setSelectedPlaces([...selectedPlaces, '']);
        }
    };

    const calculateRoute = async () => {
        const validPlaces = placesWithCoordinates.filter(place => 
            place !== null && 
            place.latitude !== undefined && 
            place.longitude !== undefined
        );

        if (validPlaces.length < 2) {
            setError('Please select at least 2 valid places');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Create places in the backend
            const placeCreationPromises = validPlaces.map(async (place) => {
                const response = await fetch('http://localhost:8000/api/places/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(place)
                });
                if (!response.ok) {
                    throw new Error('Failed to create place');
                }
                return await response.json();
            });

            const createdPlaces = await Promise.all(placeCreationPromises);

            // Calculate route
            const response = await fetch('http://localhost:8000/api/routes/calculate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    places: createdPlaces.map(place => place.id)
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to calculate route');
            }
            const data = await response.json();
            setRoute(data);
        } catch (error) {
            console.error('Error calculating route:', error);
            setError('Failed to calculate route. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
        <Head>
            <title>Travel Planner</title>
            <meta name="description" content="Plan your travel route efficiently" />
        </Head>

        <div className="container mx-auto px-2 py-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg mb-6">
                <h1 className="text-4xl font-bold text-center">Travel Route Planner</h1>
            </div>

            {/* Error Handling */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Places Selection Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Select Places</h2>
                            {placesWithCoordinates.length < 6 && (
                                <button 
                                    onClick={addPlaceInput}
                                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                    Add Place
                                </button>
                            )}
                        </div>
                        
                        {placesWithCoordinates.map((selectedPlace, index) => (
                            <div key={index} className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    {index === 0 ? 'Place 1' : `Place ${index + 1}`}
                                </label>
                                <select 
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={selectedPlaces[index] || ''}
                                    onChange={(e) => handlePlaceSelect(e.target.value, index)}
                                >
                                    <option value="">
                                        {selectedPlaces[index] 
                                            ? selectedPlaces[index] 
                                            : 'Select a place'}
                                    </option>
                                    {(index === 0 
                                        ? availablePlaces 
                                        : availablePlaces.filter(p => !selectedPlaces.includes(p)))
                                        .map(place => (
                                            <option key={place} value={place}>{place}</option>
                                        ))}
                                </select>
                            </div>
                        ))}
                        
                        <button
                            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg 
                                     hover:bg-blue-700 disabled:bg-blue-300 
                                     disabled:cursor-not-allowed transition-colors"
                            onClick={calculateRoute}
                            disabled={placesWithCoordinates.filter(p => p !== null).length < 2 || loading}
                        >
                            {loading ? 'Calculating...' : 'Calculate Route'}
                        </button>
                    </div>

                    {/* Route Details */}
                    {route && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Route Details</h2>
                            <p className="text-gray-700 mb-4">
                                Total Distance: <span className="font-semibold">{route.total_distance.toFixed(2)} km</span>
                            </p>
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Order of Places:</h3>
                                <ol className="list-decimal list-inside space-y-2">
                                    {route.places.map((place) => (
                                        <li key={place.place.id} className="text-gray-600">
                                            {place.place.name}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    )}
                </div>

                {/* Map Column - Now takes up 2 columns */}
                <div className="lg:col-span-2 h-full">
                    <div className="bg-white p-6 rounded-lg shadow-md h-full">
                        <MapComponent 
                            className="w-full h-[700px]"  // Increased height
                            places={placesWithCoordinates.filter(p => p !== null)}
                            path={route?.places.map(p => p.place) || []}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Import Map component dynamically with no SSR
const MapComponent = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => <div className="w-full h-[500px] bg-gray-100 rounded-lg animate-pulse" />
});

export default function Home() {
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [availablePlaces, setAvailablePlaces] = useState([]);
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const fetchPlaces = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/places/?state=Maharashtra');
            if (!response.ok) {
                throw new Error('Failed to fetch places');
            }
            const data = await response.json();
            setAvailablePlaces(data);
        } catch (error) {
            console.error('Error fetching places:', error);
            setError('Failed to load places. Please try again later.');
        }
    };
    
    const calculateRoute = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/api/routes/calculate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    places: selectedPlaces.map(place => place.id)
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
    
    useEffect(() => {
        fetchPlaces();
    }, []);

    return (
        <>
            <Head>
                <title>Travel Planner</title>
                <meta name="description" content="Plan your travel route efficiently" />
            </Head>

            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto p-4">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Travel Planner</h1>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Places</h2>
                                <div className="space-y-3">
                                    {availablePlaces.map(place => (
                                        <div key={place.id} className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id={`place-${place.id}`}
                                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                checked={selectedPlaces.some(p => p.id === place.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedPlaces([...selectedPlaces, place]);
                                                    } else {
                                                        setSelectedPlaces(selectedPlaces.filter(p => p.id !== place.id));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`place-${place.id}`} className="text-gray-700">
                                                {place.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                
                                <button
                                    className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                             disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                                    onClick={calculateRoute}
                                    disabled={selectedPlaces.length < 2 || loading}
                                >
                                    {loading ? 'Calculating...' : 'Calculate Route'}
                                </button>
                            </div>
                            
                            {route && (
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Route Details</h2>
                                    <p className="text-gray-700 mb-4">
                                        Total Distance: <span className="font-semibold">{route.total_distance.toFixed(2)} km</span>
                                    </p>
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">Order of Places:</h3>
                                        <ol className="list-decimal list-inside space-y-2">
                                            {route.places.map((place, index) => (
                                                <li key={place.id} className="text-gray-600">
                                                    {place.name}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow">
                            <MapComponent 
                                places={selectedPlaces}
                                path={route?.places || []}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
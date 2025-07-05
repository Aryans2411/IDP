import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PreBookingModal from './PreBookingModal';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icon for charging stations
const chargingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ChargingStationsMap = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchChargingStations = async () => {
      try {
        // First, let's try a simpler API call with fewer parameters
        const baseUrl = 'https://api.openchargemap.io/v3/poi';
        const params = new URLSearchParams({
          key: '56a3bc47-d622-4143-b7f6-1e3a1ad6595f',
          maxresults: 50,
          countrycode: 'IN',
          latitude: 12.9716,
          longitude: 77.5946,
          distance: 50,
          distanceunit: 'KM'
        });

        console.log('Fetching charging stations...');
        const response = await fetch(`${baseUrl}?${params}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-API-Key': '56a3bc47-d622-4143-b7f6-1e3a1ad6595f'
          }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }

        setStations(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching charging stations:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchChargingStations();
  }, []);

  const handleStationClick = (station) => {
    setSelectedStation({
      id: station.ID.toString(),
      name: station.AddressInfo.Title,
      latitude: station.AddressInfo.Latitude,
      longitude: station.AddressInfo.Longitude,
      address: station.AddressInfo.AddressLine1,
      town: station.AddressInfo.Town,
      state: station.AddressInfo.StateOrProvince
    });
    setIsModalOpen(true);
  };

  const handleBookingSuccess = (bookingData) => {
    console.log('Booking successful:', bookingData);
    // You can add additional logic here, such as showing a notification
    // or updating the UI to reflect the new booking
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-800 rounded-lg">
        <div className="text-white text-lg">Loading charging stations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-800 rounded-lg">
        <div className="text-red-500 text-lg">
          <p>Error loading charging stations:</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-2xl font-bold text-white mb-4">EV Charging Stations</h2>
      <div className="bg-gray-800 rounded-lg p-4">
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={12}
          style={{ height: '500px', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {stations.map((station) => (
            <Marker
              key={station.ID}
              position={[station.AddressInfo.Latitude, station.AddressInfo.Longitude]}
              icon={chargingIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{station.AddressInfo.Title}</h3>
                  <p className="text-sm">{station.AddressInfo.AddressLine1}</p>
                  <p className="text-sm">{station.AddressInfo.Town}, {station.AddressInfo.StateOrProvince}</p>
                  <p className="text-sm">Connections: {station.Connections?.length || 0}</p>
                  {station.Connections?.map((conn, index) => (
                    <p key={index} className="text-xs mt-1">
                      {conn.ConnectionType?.Title} - {conn.Level?.Title}
                    </p>
                  ))}
                  <button
                    onClick={() => handleStationClick(station)}
                    className="mt-3 w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Pre-Book This Spot
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <PreBookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStation(null);
        }}
        selectedLocation={selectedStation}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default ChargingStationsMap; 
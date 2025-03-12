import React, { useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import 'bootstrap/dist/css/bootstrap.min.css';

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 40.1934, // Kirksville, MO latitude
  lng: -92.5829, // Kirksville, MO longitude
};

const Map = () => {
  const mapRef = useRef(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Recenter the map on load
  const onLoad = useCallback((map) => {
    mapRef.current = map;
    map.setCenter(center);
  }, []);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} onLoad={onLoad}>
      <Marker position={center} />
    </GoogleMap>
  );
};

const RideListing = () => {
  return (
    <div className="container-fluid d-flex vh-100 p-0">
      {/* Map Section (70% - subject to change) */}
      <div className="col-8 p-0">
        <Map />
      </div>

      {/* Ride Listings Section (30% - subject to change) */}
      <div className="col-4 bg-dark text-white p-4 rounded-3">
        <h3 className="mb-4">Ride Listings</h3>
        <ul className="list-unstyled">
          <li className="mb-3">
            <div className="border p-3 rounded-3">
              <h5>Ride to X Destination</h5>
              <p>Looking for a ride to X. Let me know if you're heading that way!</p>
            </div>
          </li>
          <li className="mb-3">
            <div className="border p-3 rounded-3">
              <h5>Going to Y Place</h5>
              <p>I'm planning to go to Y place. Anyone interested in joining?</p>
            </div>
          </li>
          {/* Add more listings here (likely pull from Firebase/MongoDB) */}
        </ul>
      </div>
    </div>
  );
};

export default RideListing;
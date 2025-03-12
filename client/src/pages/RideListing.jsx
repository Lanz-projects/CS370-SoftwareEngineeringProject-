import React, { useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100vw",
  height: "80vh",
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
    <div className="map-container">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} onLoad={onLoad}>
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
};

const RideListing = () => {
  return (
    <div>
      <h1>This is the RideListing page</h1>
      <Map />
    </div>
  );
};

export default RideListing;

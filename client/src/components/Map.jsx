import React, { useCallback, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100vw",
  height: "80vh",
};

const center = {
  lat: 40.1934, // Example latitude
  lng: -92.5829, // Example longitude (Kirksville, MO)
};

const Map = () => {
  const mapRef = useRef(null);

  // this recenters the map
  const onLoad = useCallback((map) => {
    mapRef.current = map;
    map.setCenter(center);
  }, []);

  return (
    <div className="map-container">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap 
          mapContainerStyle={containerStyle} 
          center={center} 
          zoom={12} 
          onLoad={onLoad}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default Map;

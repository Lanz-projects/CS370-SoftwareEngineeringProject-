import React, { useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 40.1934,
  lng: -92.5829,
};

const Map = ({ offerings = [], requests = [] }) => {
  const mapRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback((map) => {
    const bounds = new window.google.maps.LatLngBounds();
    mapRef.current = map;
    
    bounds.extend(center);
    
    offerings.forEach(offering => {
      if (offering.location?.coordinates) {
        bounds.extend({
          lat: offering.location.coordinates[1],
          lng: offering.location.coordinates[0]
        });
      }
    });
    
    requests.forEach(request => {
      if (request.location?.coordinates) {
        bounds.extend({
          lat: request.location.coordinates[1],
          lng: request.location.coordinates[0]
        });
      }
    });
    
    if (offerings.length > 0 || requests.length > 0) {
      map.fitBounds(bounds);
    } else {
      map.setCenter(center);
      map.setZoom(12);
    }
  }, [offerings, requests]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap 
      mapContainerStyle={containerStyle} 
      center={center} 
      zoom={12} 
      onLoad={onLoad}
    >
      <Marker position={center} />
      
      {offerings.map((offering) => {
        if (!offering.location?.coordinates) return null;
        return (
          <Marker
            key={`offering-${offering._id}`}
            position={{
              lat: offering.location.coordinates[1],
              lng: offering.location.coordinates[0],
            }}
            title={`Offering from ${offering.name}`}
          />
        );
      })}
      
      {requests.map((request) => {
        if (!request.location?.coordinates) return null;
        return (
          <Marker
            key={`request-${request._id}`}
            position={{
              lat: request.location.coordinates[1],
              lng: request.location.coordinates[0],
            }}
            title={`Request from ${request.name}`}
          />
        );
      })}
    </GoogleMap>
  );
};

export default Map;
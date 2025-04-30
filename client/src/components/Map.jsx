import React, { useCallback, useRef, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Truman State University coordinates
const center = {
  lat: 40.1885,
  lng: -92.5833,
};

const Map = ({ offerings = [], requests = [], onMarkerClick, selectedMarkerId }) => {
  const mapRef = useRef(null);
  
  // Memoize the loader options to prevent re-creation on every render
  const loaderOptions = useMemo(() => ({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  }), []);

  const { isLoaded, loadError } = useJsApiLoader(loaderOptions);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    const bounds = new window.google.maps.LatLngBounds();
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

  // Define pin icons
  const pinConfig = {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 1,
    scale: 1.5,
    anchor: { x: 12, y: 24 },
  };

  if (loadError) {
    return <div className="text-danger">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div className="text-muted">Loading Google Maps...</div>;
  }

  return (
    <GoogleMap 
      mapContainerStyle={containerStyle} 
      center={center} 
      zoom={12} 
      onLoad={onLoad}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      <Marker 
        position={center} 
        title="Truman State University"
        icon={{
          ...pinConfig,
          fillColor: "#510b76"
        }}
        zIndex={1000}
      />
      
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
            icon={{
              ...pinConfig,
              fillColor: "#4285F4"
            }}
            onClick={() => onMarkerClick(`offering-${offering._id}`)}
            zIndex={selectedMarkerId === `offering-${offering._id}` ? 1000 : 1}
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
            icon={{
              ...pinConfig,
              fillColor: "#0F9D58"
            }}
            onClick={() => onMarkerClick(`request-${request._id}`)}
            zIndex={selectedMarkerId === `request-${request._id}` ? 1000 : 1}
          />
        );
      })}
    </GoogleMap>
  );
};

export default Map;
import React, { useCallback, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import RequestRide from "../components/RequestRide";
import PostRideListing from "../components/PostRideListing";
import Navigationbar from "../components/Navigationbar";
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
    <GoogleMap mapContainerStyle = {containerStyle} center = {center} zoom = {12} onLoad = {onLoad}>
      <Marker position = {center} />
    </GoogleMap>
  );
};

const RideListing = () => {
  const [showRequestRideModal, setShowRequestRideModal] = useState(false);
  const [showPostRideListingModal, setShowPostRideListingModal] = useState(false);

  return (
    <div>
      <Navigationbar></Navigationbar>
      <div className = "container-fluid d-flex vh-100 p-0">
        {/* Map Section (70%) */}
        <div className = "col-lg-8 col-md-7 p-0">
          <Map />
        </div>

        {/* Ride Listings Section (30%) */}
        <div className = "col-lg-4 col-md-5 bg-white text-black p-4 rounded-3">
          {/* Buttons for Request a Ride and Post a Ride Listing */}
          <div className = "d-flex justify-content-between mb-4">
            <button 
              className = "btn btn-light text-white rounded-pill flex-grow-1 me-2" 
              onClick = {() => setShowRequestRideModal(true)}
              style = {{ backgroundColor: 'black', color: '#510b76', border: 'none' }}
            >
              Request a Ride
            </button>
            <button 
              className = "btn btn-light text-white rounded-pill flex-grow-1 ms-2" 
              onClick = {() => setShowPostRideListingModal(true)}
              style = {{ backgroundColor: 'black', color: '#510b76', border: 'none' }}
            >
              Post a Ride Listing
            </button>
          </div>

          {/* Modals for Request a Ride and Post a Ride Listing */}
          <RequestRide 
            show = {showRequestRideModal} 
            handleClose = {() => setShowRequestRideModal(false)} 
          />
          <PostRideListing 
            show = {showPostRideListingModal} 
            handleClose = {() => setShowPostRideListingModal(false)} 
          />

          <h3 className = "mb-4">Ride Listings</h3>
          <ul className = "list-unstyled">
            <li className = "mb-3">
              <div className = "border p-3 rounded-3">
                <h5>Ride to X Destination</h5>
                <p>Looking for a ride to X. Let me know if you're heading that way!</p> {/* Temp placeholders */}
              </div>
            </li>
            <li className = "mb-3">
              <div className = "border p-3 rounded-3">
                <h5>Going to Y Place</h5>
                <p>I'm planning to go to Y place. Anyone interested in joining?</p> {/* Temp placeholders */}
              </div>
            </li>
            {/* Consider adding functionality for dynamically loading ride listings here */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RideListing;
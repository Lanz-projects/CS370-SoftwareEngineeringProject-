import React, { useCallback, useRef, useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import RequestRide from "./RequestRide";
import PostRideListing from "./PostRideListing";
import OfferingCard from "./OfferingCard";
import RequestCard from "./RequestCard";

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

const RideListingLayout = () => {
  const [showRequestRideModal, setShowRequestRideModal] = useState(false);
  const [showPostRideListingModal, setShowPostRideListingModal] = useState(false);
  const [offeringList, setOfferingList] = useState([]);
  const [requestList, setRequestList] = useState([]);

  // Fetch all offerings and requests on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/all-data", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`, // Assuming you have a token for authorization
          },
        });
        const data = await response.json();
        if (data) {
          setOfferingList(data.offerings);
          setRequestList(data.requests);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <div className="container-fluid d-flex vh-100 p-0">
      {/* Map Section (70%) */}
      <div className="col-lg-8 col-md-7 p-0">
        <Map />
      </div>

      {/* Ride Listings Section (30%) */}
      <div className="col-lg-4 col-md-5 bg-white text-black p-4 rounded-3">
        {/* Buttons for Request a Ride and Post a Ride Listing */}
        <div className="d-flex justify-content-between mb-4">
          <button
            className="btn btn-light text-white rounded-pill flex-grow-1 me-2"
            onClick={() => setShowRequestRideModal(true)}
            style={{ backgroundColor: "black", color: "#510b76", border: "none" }}
          >
            Request a Ride
          </button>
          <button
            className="btn btn-light text-white rounded-pill flex-grow-1 ms-2"
            onClick={() => setShowPostRideListingModal(true)}
            style={{ backgroundColor: "black", color: "#510b76", border: "none" }}
          >
            Post a Ride Listing
          </button>
        </div>

        {/* Modals for Request a Ride and Post a Ride Listing */}
        <RequestRide show={showRequestRideModal} handleClose={() => setShowRequestRideModal(false)} />
        <PostRideListing show={showPostRideListingModal} handleClose={() => setShowPostRideListingModal(false)} />

        <h3 className="mb-4">Ride Listings</h3>

        {/* Displaying Offerings and Requests */}
        <div>
          {offeringList.length === 0 && requestList.length === 0 ? (
            <p>No ride listings available.</p>
          ) : (
            <div>
              {offeringList.length > 0 && (
                <div>
                  <h5>Offering Listings</h5>
                  {offeringList.map((offering) => (
                    <OfferingCard key={offering._id} offering={offering} />
                  ))}
                </div>
              )}

              {requestList.length > 0 && (
                <div>
                  <h5>Request Listings</h5>
                  {requestList.map((request) => (
                    <RequestCard key={request._id} request={request} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideListingLayout;

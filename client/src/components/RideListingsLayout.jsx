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
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/all-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data) {
        setOfferingList(data.offerings || []);
        setRequestList(data.requests || []);
      }
    } catch (error) {
      setError(error.message);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewRequest = (newRequest) => {
    setRequestList(prev => [newRequest, ...prev]);
  };

  if (loading) {
    return (
      <div className="container-fluid d-flex vh-100 p-0">
        <div className="d-flex justify-content-center align-items-center w-100">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid d-flex vh-100 p-0">
        <div className="alert alert-danger w-100 m-3">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid d-flex vh-100 p-0">
      {/* Map Section (70%) */}
      <div className="col-lg-8 col-md-7 p-0">
        <Map />
      </div>

      {/* Ride Listings Section (30%) */}
      <div className="col-lg-4 col-md-5 bg-white text-black p-4 rounded-3 d-flex flex-column">
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

        <RequestRide 
          show={showRequestRideModal} 
          handleClose={() => setShowRequestRideModal(false)}
          onRequestSubmit={handleNewRequest}
        />
        <PostRideListing 
          show={showPostRideListingModal} 
          handleClose={() => setShowPostRideListingModal(false)} 
        />

        <h3 className="mb-4">Ride Listings</h3>

        <div className="overflow-auto" style={{ flexGrow: 1, maxHeight: 'calc(100vh - 180px)' }}>
          {offeringList.length === 0 && requestList.length === 0 ? (
            <p>No ride listings available.</p>
          ) : (
            <div>
              {offeringList.length > 0 && (
                <div className="mb-4">
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

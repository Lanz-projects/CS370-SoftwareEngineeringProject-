import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import "bootstrap/dist/css/bootstrap.min.css";
import RequestRide from "./RequestRide";
import PostRideListing from "./PostRideListing";
import FilterModal from "./FilterModal";
import OfferingCard from "./OfferingCard";
import RequestCard from "./RequestCard";
import Map from "./Map";

const RideListingLayout = () => {
  const [showRequestRideModal, setShowRequestRideModal] = useState(false);
  const [showPostRideListingModal, setShowPostRideListingModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [offeringList, setOfferingList] = useState([]);
  const [requestList, setRequestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteOfferIDList, setfavoriteOfferIDList] = useState([]);
  const [favoriteRequestIDList, setfavoriteRequestIDList] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    showOfferings: true,
    showRequests: true,
    sortBy: "default",
  });
  const [showMapMobile, setShowMapMobile] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch("http://localhost:5000/api/all-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
  }, [filterOptions]);

  const handleNewRequest = (newRequest) => {
    if (!newRequest?.request?._id) {
      console.error("Invalid request data:", newRequest);
      return;
    }
    setRequestList(prev => [newRequest.request, ...prev]);
  };

  const handleNewOffering = (newOffering) => {
    if (!newOffering?.offering?._id) {
      console.error("Invalid offering data:", newOffering);
      return;
    }
    setOfferingList(prev => [newOffering.offering, ...prev]);
  };

  const toggleMapMobile = () => {
    setShowMapMobile(!showMapMobile);
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
    <>
      {/* Desktop View */}
      <div className="container-fluid d-none d-md-flex vh-100 p-0">
        <div className="col-lg-8 col-md-7 p-0">
          <Map offerings={offeringList} requests={requestList} />
        </div>

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
            onRequestCreated={handleNewRequest}
          />
          <PostRideListing 
            show={showPostRideListingModal} 
            handleClose={() => setShowPostRideListingModal(false)}
            onOfferingCreated={handleNewOffering}
          />

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">Ride Listings</h3>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setShowFilterModal(true)}
            >
              Filter
            </button>
          </div>

          <FilterModal
            show={showFilterModal}
            handleClose={() => setShowFilterModal(false)}
            filterOptions={filterOptions}
            setFilterOptions={setFilterOptions}
          />

          <div className="overflow-auto" style={{ flexGrow: 1, maxHeight: 'calc(100vh - 180px)' }}>
            {offeringList.length === 0 && requestList.length === 0 ? (
              <p>No ride listings available.</p>
            ) : (
              <div>
                {filterOptions.showOfferings && offeringList.length > 0 && (
                  <div className="mb-4">
                    <h5>Offering Listings</h5>
                    {offeringList.map((offering) => (
                      <OfferingCard key={offering._id} offering={offering} />
                    ))}
                  </div>
                )}

                {filterOptions.showRequests && requestList.length > 0 && (
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

      {/* Mobile View */}
      <div className="container-fluid d-flex d-md-none flex-column vh-100 p-0">
        {showMapMobile && (
          <div style={{ height: "40vh" }}>
            <Map offerings={offeringList} requests={requestList} />
          </div>
        )}

        <div className="bg-white text-black p-3 d-flex flex-column" 
             style={{ height: showMapMobile ? "60vh" : "100vh", overflowY: "auto" }}>
          <div className="d-flex justify-content-between mb-3">
            <button
              className="btn btn-light text-white rounded-pill flex-grow-1 me-2"
              onClick={() => setShowRequestRideModal(true)}
              style={{ backgroundColor: "black", color: "#510b76", border: "none" }}
            >
              Request Ride
            </button>
            <button
              className="btn btn-light text-white rounded-pill flex-grow-1 ms-2"
              onClick={() => setShowPostRideListingModal(true)}
              style={{ backgroundColor: "black", color: "#510b76", border: "none" }}
            >
              Post Ride
            </button>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <button
              className="btn btn-outline-secondary flex-grow-1 me-1"
              onClick={() => setShowFilterModal(true)}
            >
              Filter
            </button>
            <button
              className="btn btn-outline-secondary flex-grow-1 ms-1"
              onClick={toggleMapMobile}
            >
              {showMapMobile ? "Hide Map" : "Show Map"}
            </button>
          </div>

          <h3 className="mb-3">Ride Listings</h3>

          <div className="overflow-auto">
            {offeringList.length === 0 && requestList.length === 0 ? (
              <p>No ride listings available.</p>
            ) : (
              <div>
                {filterOptions.showOfferings && offeringList.length > 0 && (
                  <div className="mb-4">
                    <h5>Offering Listings</h5>
                    {offeringList.map((offering) => (
                      <OfferingCard key={offering._id} offering={offering} />
                    ))}
                  </div>
                )}

                {filterOptions.showRequests && requestList.length > 0 && (
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
    </>
  );
};

export default RideListingLayout;
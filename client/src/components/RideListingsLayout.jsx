import React, { useCallback, useRef, useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import "bootstrap/dist/css/bootstrap.min.css";
import RequestRide from "./RequestRide";
import PostRideListing from "./PostRideListing";
import FilterModal from "./FilterModal";
import OfferingCard from "./OfferingCard";
import RequestCard from "./RequestCard";

// Map component with responsive height
const Map = ({ className }) => {
  const mapRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const center = {
    lat: 40.1934, // Kirksville, MO latitude
    lng: -92.5829, // Kirksville, MO longitude
  };

  const containerStyle = {
    width: "100%",
    height: "100%",
  };

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    map.setCenter(center);
  }, []);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
};

const RideListingLayout = () => {
  const [showRequestRideModal, setShowRequestRideModal] = useState(false);
  const [showPostRideListingModal, setShowPostRideListingModal] =
    useState(false);
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
  // New state for map toggle on mobile
  const [showMapMobile, setShowMapMobile] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      let offeringsData = [];
      let requestsData = [];

      // Determine which endpoints to use based on filter sorting option
      if (filterOptions.sortBy === "soonest") {
        // Get closest arrival date data
        if (filterOptions.showOfferings) {
          const offeringsResponse = await fetch(
            "/api/offerings/closest-arrival",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (offeringsResponse.ok) {
            const offeringsResult = await offeringsResponse.json();
            offeringsData = Array.isArray(offeringsResult)
              ? offeringsResult
              : [offeringsResult];
          }
        }

        if (filterOptions.showRequests) {
          const requestsResponse = await fetch(
            "/api/requests/closest-arrival",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (requestsResponse.ok) {
            const requestsResult = await requestsResponse.json();
            requestsData = Array.isArray(requestsResult)
              ? requestsResult
              : [requestsResult];
          }
        }
      } else if (filterOptions.sortBy === "latest") {
        // Get farthest arrival date data
        if (filterOptions.showOfferings) {
          const offeringsResponse = await fetch(
            "/api/offerings/farthest-arrival",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (offeringsResponse.ok) {
            const offeringsResult = await offeringsResponse.json();
            offeringsData = Array.isArray(offeringsResult)
              ? offeringsResult
              : [offeringsResult];
          }
        }

        if (filterOptions.showRequests) {
          const requestsResponse = await fetch(
            "/api/requests/farthest-arrival",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (requestsResponse.ok) {
            const requestsResult = await requestsResponse.json();
            requestsData = Array.isArray(requestsResult)
              ? requestsResult
              : [requestsResult];
          }
        }
      } else {
        // Default sorting (by creation time probably)
        if (filterOptions.showOfferings || filterOptions.showRequests) {
          const response = await fetch("/api/all-data", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data) {
            offeringsData = filterOptions.showOfferings
              ? data.offerings || []
              : [];
            requestsData = filterOptions.showRequests
              ? data.requests || []
              : [];
          }
        }
      }

      setOfferingList(offeringsData);
      setRequestList(requestsData);

      // Fetching favorite ids
      const favoriteIdsResponse = await fetch("/api/favorites-ids", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const favoriteIdsData = await favoriteIdsResponse.json();
      setfavoriteOfferIDList(favoriteIdsData.favoriteOfferingsID);
      setfavoriteRequestIDList(favoriteIdsData.favoriteRequestsID);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch data when filter options change
  useEffect(() => {
    fetchData();
  }, [filterOptions]);

  const handleNewRequest = (newRequest) => {
    setRequestList((prev) => [newRequest, ...prev]);
  };

  // Toggle map visibility for mobile
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

  // Build the control buttons for both views
  const controlButtons = (isMobile = false) => (
    <div className="d-flex flex-column flex-md-row justify-content-between mb-3 gap-2">
      <button
        className="btn rounded-pill"
        onClick={() => setShowRequestRideModal(true)}
        style={{
          backgroundColor: "#b08fd8",
          color: "#ffffff",
          border: "none",
        }}
      >
        Request a Ride
      </button>

      <button
        className="btn rounded-pill"
        onClick={() => setShowPostRideListingModal(true)}
        style={{
          backgroundColor: "#b08fd8",
          color: "#ffffff",
          border: "none",
        }}
      >
        Post a Ride Listing
      </button>

      {/* Filter and Map Toggle buttons for mobile */}
      {isMobile ? (
        <div className="d-flex gap-1">
          <button
            className="btn rounded-start w-50"
            onClick={() => setShowFilterModal(true)}
            style={{
              backgroundColor: "#b08fd8",
              color: "#ffffff",
              border: "none",
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            ☰ Filter
          </button>
          <button
            className="btn rounded-end w-50"
            onClick={toggleMapMobile}
            style={{
              backgroundColor: "#b08fd8",
              color: "#ffffff",
              border: "none",
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            Map {showMapMobile ? "▼" : "▲"}
          </button>
        </div>
      ) : (
        /* Regular filter button for desktop */
        <button
          className="btn rounded-pill"
          onClick={() => setShowFilterModal(true)}
          style={{
            backgroundColor: "#b08fd8",
            color: "#ffffff",
            border: "none",
          }}
        >
          ☰ Filter
        </button>
      )}
    </div>
  );

  // Common elements for both desktop and mobile views
  const rideListingContent = (isMobile) => (
    <>
      {/* Themed Buttons: Request, Post, Filter */}
      {controlButtons(isMobile)}

      {/* Active Filters Display */}
      <div className="mb-3">
        <small className="text-muted">
          <strong>Active Filters:</strong>{" "}
          {filterOptions.sortBy !== "default"
            ? `Sorting by ${
                filterOptions.sortBy === "soonest" ? "soonest" : "latest"
              } arrival date`
            : "No sorting applied"}
          {!filterOptions.showOfferings &&
            filterOptions.showRequests &&
            " | Requests only"}
          {filterOptions.showOfferings &&
            !filterOptions.showRequests &&
            " | Offerings only"}
        </small>
      </div>

      <h3 className="mb-3">Ride Listings</h3>

      <div className="overflow-auto flex-grow-1">
        {!filterOptions.showOfferings && !filterOptions.showRequests ? (
          <p>No listings match your current filters.</p>
        ) : offeringList.length === 0 && requestList.length === 0 ? (
          <p>No ride listings available.</p>
        ) : (
          <div>
            {filterOptions.showOfferings && offeringList.length > 0 && (
              <div className="mb-4">
                <h5>
                  Offering Listings{" "}
                  {offeringList.length > 0 && `(${offeringList.length})`}
                </h5>
                {offeringList.map((offering) => (
                  <OfferingCard
                    key={offering._id}
                    offering={offering}
                    userFavorites={favoriteOfferIDList}
                  />
                ))}
              </div>
            )}

            {filterOptions.showRequests && requestList.length > 0 && (
              <div>
                <h5>
                  Request Listings{" "}
                  {requestList.length > 0 && `(${requestList.length})`}
                </h5>
                {requestList.map((request) => (
                  <RequestCard
                    key={request._id}
                    request={request}
                    userFavorites={favoriteRequestIDList}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Modals */}
      <RequestRide
        show={showRequestRideModal}
        handleClose={() => setShowRequestRideModal(false)}
        onRequestSubmit={handleNewRequest}
      />
      <PostRideListing
        show={showPostRideListingModal}
        handleClose={() => setShowPostRideListingModal(false)}
      />
      <FilterModal
        show={showFilterModal}
        handleClose={() => setShowFilterModal(false)}
        setFilterOptions={setFilterOptions}
      />

      {/* Desktop View (Original side-by-side layout) - Only shown on md screens and up */}
      <div className="container-fluid d-none d-md-flex vh-100 p-0">
        {/* Map Section (70%) */}
        <div className="col-lg-8 col-md-7 p-0 h-100">
          <Map className="h-100" />
        </div>

        {/* Ride Listings Section (30%) */}
        <div className="col-lg-4 col-md-5 bg-white text-black p-4 rounded-3 d-flex flex-column">
          {rideListingContent(false)}
        </div>
      </div>

      {/* Mobile View (Stacked layout) - Only shown on small screens */}
      <div className="container-fluid d-flex d-md-none flex-column vh-100 p-0">
        {/* Map Section - Collapsible on mobile */}
        {showMapMobile && (
          <div style={{ height: "30vh" }}>
            <Map className="h-100" />
          </div>
        )}

        {/* Ride Listings Section - Takes full height when map is closed */}
        <div
          className="w-100 bg-white text-black p-3 d-flex flex-column"
          style={{ 
            height: showMapMobile ? "70vh" : "100vh", 
            overflowY: "auto",
            transition: "height 0.3s ease-in-out"
          }}
        >
          {rideListingContent(true)}
        </div>
      </div>
    </>
  );
};

export default RideListingLayout;
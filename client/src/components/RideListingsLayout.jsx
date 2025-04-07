import React, { useState, useEffect, useRef, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import "bootstrap/dist/css/bootstrap.min.css";
import RequestRide from "./RequestRide";
import PostRideListing from "./PostRideListing";
import FilterModal from "./FilterModal";
import OfferingCard from "./OfferingCard";
import RequestCard from "./RequestCard";
import Map from "./Map";
import "./RideListingLayout.css";

const RideListingLayout = () => {
  const [showRequestRideModal, setShowRequestRideModal] = useState(false);
  const [showPostRideListingModal, setShowPostRideListingModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [offeringList, setOfferingList] = useState([]);
  const [requestList, setRequestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    showOfferings: true,
    showRequests: true,
    sortBy: "default",
    showFavorites: false,
  });
  const [showMapMobile, setShowMapMobile] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [favoriteOfferIDList, setFavoriteOfferIDList] = useState([]);
  const [favoriteRequestIDList, setFavoriteRequestIDList] = useState([]);
  const cardsRef = useRef(null);

  // Sort listings based on arrival time and filter by favorites
  const sortedOfferings = useMemo(() => {
    let offerings = [...offeringList];
    
    // Filter by favorites if enabled
    if (filterOptions.showFavorites) {
      offerings = offerings.filter(offering => 
        favoriteOfferIDList.includes(offering._id)
      );
    }
    
    // Sort
    if (filterOptions.sortBy === "soonest") {
      return offerings.sort((a, b) => new Date(a.arrivaldate || a.arrivalTime) - new Date(b.arrivaldate || b.arrivalTime));
    } else if (filterOptions.sortBy === "latest") {
      return offerings.sort((a, b) => new Date(b.arrivaldate || b.arrivalTime) - new Date(a.arrivaldate || a.arrivalTime));
    }
    return offerings;
  }, [offeringList, filterOptions.sortBy, filterOptions.showFavorites, favoriteOfferIDList]);

  const sortedRequests = useMemo(() => {
    let requests = [...requestList];
    
    // Filter by favorites if enabled
    if (filterOptions.showFavorites) {
      requests = requests.filter(request => 
        favoriteRequestIDList.includes(request._id)
      );
    }
    
    // Sort
    if (filterOptions.sortBy === "soonest") {
      return requests.sort((a, b) => new Date(a.arrivaldate || a.arrivalTime) - new Date(b.arrivaldate || b.arrivalTime));
    } else if (filterOptions.sortBy === "latest") {
      return requests.sort((a, b) => new Date(b.arrivaldate || b.arrivalTime) - new Date(a.arrivaldate || a.arrivalTime));
    }
    return requests;
  }, [requestList, filterOptions.sortBy, filterOptions.showFavorites, favoriteRequestIDList]);

  const handleMarkerClick = (id) => {
    setSelectedMarkerId(id);
    setSelectedCardId(id);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        element.classList.add('highlight-card');
        setTimeout(() => {
          element.classList.remove('highlight-card');
        }, 2000);
      }
    }, 100);
  };

  const clearSelection = () => {
    setSelectedMarkerId(null);
    setSelectedCardId(null);
  };

  const toggleMapMobile = () => {
    setShowMapMobile(!showMapMobile);
  };

  const toggleFavorite = async (type, id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
  
      const isFavorite = type === 'offering' 
        ? favoriteOfferIDList.includes(id)
        : favoriteRequestIDList.includes(id);
  
      const endpoint = isFavorite ? 'remove-favorite' : 'add-favorite';
      
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          id
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // Update the favorite IDs list immediately for responsive UI
      if (type === 'offering') {
        setFavoriteOfferIDList(prev => {
          const newList = isFavorite 
            ? prev.filter(item => item !== id)
            : [...prev, id];
          
          // If we just removed the last favorite and favorites filter is on
          if (isFavorite && newList.length === 0 && filterOptions.showFavorites) {
            setFilterOptions(prev => ({
              ...prev,
              showFavorites: false
            }));
          }
          return newList;
        });
      } else {
        setFavoriteRequestIDList(prev => {
          const newList = isFavorite 
            ? prev.filter(item => item !== id)
            : [...prev, id];
          
          // If we just removed the last favorite and favorites filter is on
          if (isFavorite && newList.length === 0 && filterOptions.showFavorites) {
            setFilterOptions(prev => ({
              ...prev,
              showFavorites: false
            }));
          }
          return newList;
        });
      }
  
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

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
          Authorization: `Bearer ${token}`,
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

      // Fetch favorite IDs
      const favoriteIdsResponse = await fetch(
        "http://localhost:5000/api/favorites-ids",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const favoriteIdsdata = await favoriteIdsResponse.json();
      setFavoriteOfferIDList(favoriteIdsdata.favoriteOfferingsID || []);
      setFavoriteRequestIDList(favoriteIdsdata.favoriteRequestsID || []);

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
          <Map 
            offerings={sortedOfferings} 
            requests={sortedRequests} 
            onMarkerClick={handleMarkerClick}
            selectedMarkerId={selectedMarkerId}
          />
        </div>

        <div className="col-lg-4 col-md-5 bg-white text-black p-4 rounded-3 d-flex flex-column">
          <div className="d-flex justify-content-between mb-4">
            <button
              className="btn btn-light text-white rounded-pill flex-grow-1 me-2"
              onClick={() => setShowRequestRideModal(true)}
              style={{ backgroundColor: "#4285F4", border: "none" }}
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
            <div>
              {selectedMarkerId && (
                <button 
                  className="btn btn-light text-white rounded-pill me-2"
                  onClick={clearSelection}
                  style={{ backgroundColor: "#4285F4", border: "none" }}
                >
                  Show All
                </button>
              )}
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setShowFilterModal(true)}
              >
                Filter
              </button>
            </div>
          </div>

          <FilterModal
            show={showFilterModal}
            handleClose={() => setShowFilterModal(false)}
            filterOptions={filterOptions}
            setFilterOptions={setFilterOptions}
            favoriteOfferIDList={favoriteOfferIDList}
            favoriteRequestIDList={favoriteRequestIDList}
          />

          <div className="overflow-auto" style={{ flexGrow: 1, maxHeight: 'calc(100vh - 180px)' }} ref={cardsRef}>
            {sortedOfferings.length === 0 && sortedRequests.length === 0 ? (
              <p>No ride listings available.</p>
            ) : (
              <div>
                {!selectedMarkerId && filterOptions.showOfferings && sortedOfferings.length > 0 && (
                  <div className="mb-4">
                    <h5>Offering Listings</h5>
                    {sortedOfferings.map((offering) => (
                      <div 
                        id={`offering-${offering._id}`}
                        key={`offering-${offering._id}`}
                        className={selectedCardId === `offering-${offering._id}` ? 'selected-card' : ''}
                      >
                        <OfferingCard 
                          offering={offering} 
                          userFavorites={favoriteOfferIDList}
                          onToggleFavorite={() => toggleFavorite('offering', offering._id)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {!selectedMarkerId && filterOptions.showRequests && sortedRequests.length > 0 && (
                  <div>
                    <h5>Request Listings</h5>
                    {sortedRequests.map((request) => (
                      <div 
                        id={`request-${request._id}`}
                        key={`request-${request._id}`}
                        className={selectedCardId === `request-${request._id}` ? 'selected-card' : ''}
                      >
                        <RequestCard 
                          request={request} 
                          userFavorites={favoriteRequestIDList}
                          onToggleFavorite={() => toggleFavorite('request', request._id)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {selectedMarkerId && (
                  <>
                    {sortedOfferings.map((offering) => (
                      selectedMarkerId === `offering-${offering._id}` && (
                        <div 
                          id={`offering-${offering._id}`}
                          key={`offering-${offering._id}`}
                          className="selected-card"
                        >
                          <OfferingCard 
                            offering={offering} 
                            userFavorites={favoriteOfferIDList}
                            onToggleFavorite={() => toggleFavorite('offering', offering._id)}
                          />
                        </div>
                      )
                    ))}
                    {sortedRequests.map((request) => (
                      selectedMarkerId === `request-${request._id}` && (
                        <div 
                          id={`request-${request._id}`}
                          key={`request-${request._id}`}
                          className="selected-card"
                        >
                          <RequestCard 
                            request={request} 
                            userFavorites={favoriteRequestIDList}
                            onToggleFavorite={() => toggleFavorite('request', request._id)}
                          />
                        </div>
                      )
                    ))}
                  </>
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
            <Map 
              offerings={sortedOfferings} 
              requests={sortedRequests} 
              onMarkerClick={handleMarkerClick}
              selectedMarkerId={selectedMarkerId}
            />
          </div>
        )}

        <div className="bg-white text-black p-3 d-flex flex-column" 
             style={{ height: showMapMobile ? "60vh" : "100vh", overflowY: "auto" }}>
          <div className="d-flex justify-content-between mb-3">
            <button
              className="btn btn-light text-white rounded-pill flex-grow-1 me-2"
              onClick={() => setShowRequestRideModal(true)}
              style={{ backgroundColor: "#4285F4", border: "none" }}
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
            {selectedMarkerId && (
              <button 
                className="btn btn-light text-white rounded-pill flex-grow-1 ms-1"
                onClick={clearSelection}
                style={{ backgroundColor: "#4285F4", border: "none" }}
              >
                Show All
              </button>
            )}
          </div>

          <FilterModal
            show={showFilterModal}
            handleClose={() => setShowFilterModal(false)}
            filterOptions={filterOptions}
            setFilterOptions={setFilterOptions}
            favoriteOfferIDList={favoriteOfferIDList}
            favoriteRequestIDList={favoriteRequestIDList}
          />

          <h3 className="mb-3">Ride Listings</h3>

          <div className="overflow-auto">
            {sortedOfferings.length === 0 && sortedRequests.length === 0 ? (
              <p>No ride listings available.</p>
            ) : (
              <div>
                {!selectedMarkerId && filterOptions.showOfferings && sortedOfferings.length > 0 && (
                  <div className="mb-4">
                    <h5>Offering Listings</h5>
                    {sortedOfferings.map((offering) => (
                      <div 
                        id={`offering-${offering._id}`}
                        key={`offering-${offering._id}`}
                        className={selectedCardId === `offering-${offering._id}` ? 'selected-card' : ''}
                      >
                        <OfferingCard 
                          offering={offering} 
                          userFavorites={favoriteOfferIDList}
                          onToggleFavorite={() => toggleFavorite('offering', offering._id)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {!selectedMarkerId && filterOptions.showRequests && sortedRequests.length > 0 && (
                  <div>
                    <h5>Request Listings</h5>
                    {sortedRequests.map((request) => (
                      <div 
                        id={`request-${request._id}`}
                        key={`request-${request._id}`}
                        className={selectedCardId === `request-${request._id}` ? 'selected-card' : ''}
                      >
                        <RequestCard 
                          request={request} 
                          userFavorites={favoriteRequestIDList}
                          onToggleFavorite={() => toggleFavorite('request', request._id)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {selectedMarkerId && (
                  <>
                    {sortedOfferings.map((offering) => (
                      selectedMarkerId === `offering-${offering._id}` && (
                        <div 
                          id={`offering-${offering._id}`}
                          key={`offering-${offering._id}`}
                          className="selected-card"
                        >
                          <OfferingCard 
                            offering={offering} 
                            userFavorites={favoriteOfferIDList}
                            onToggleFavorite={() => toggleFavorite('offering', offering._id)}
                          />
                        </div>
                      )
                    ))}
                    {sortedRequests.map((request) => (
                      selectedMarkerId === `request-${request._id}` && (
                        <div 
                          id={`request-${request._id}`}
                          key={`request-${request._id}`}
                          className="selected-card"
                        >
                          <RequestCard 
                            request={request} 
                            userFavorites={favoriteRequestIDList}
                            onToggleFavorite={() => toggleFavorite('request', request._id)}
                          />
                        </div>
                      )
                    ))}
                  </>
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
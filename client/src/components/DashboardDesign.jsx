import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserAgreementPopup from "../components/UserAgreement";
import RedirectUserInfoPopup from "./RedirectUserInfoPopup";
import OfferingCard from "./OfferingCard";
import RequestCard from "./RequestCard";
import DashboardRequestCard from "./DashboardRequestingCard";
import DashboardOfferingCard from "./DashboardOfferingCard";

function DashboardLayout() {
  const [offeringList, setOfferingList] = useState([]);
  const [requestUserList, setrequestUserList] = useState([]);
  const [offeringUserList, setofferingUserList] = useState([]);
  const [requestList, setRequestList] = useState([]);
  const [favoriteRequestList, setfavoriteRequestList] = useState([]);
  const [favoriteOfferList, setfavoriteOfferList] = useState([]);
  const [favoriteOfferIDList, setfavoriteOfferIDList] = useState([]);
  const [favoriteRequestIDList, setfavoriteRequestIDList] = useState([]);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showNextPopup, setShowNextPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentViewOption, setRecentViewOption] = useState("both");
  const [yourPostViewOption, setYourPostViewOption] = useState("both");
  const [mobileView, setMobileView] = useState("recent");
  const [isMobile, setIsMobile] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/api/recent-data", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setOfferingList(data.offerings || []);
        setRequestList(data.requests || []);

        const offeringsResponse = await fetch(
          "http://localhost:5000/api/offerings",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal,
          }
        );

        if (!offeringsResponse.ok) {
          throw new Error("Failed to fetch User's offerings");
        }
        const userOfferingdata = await offeringsResponse.json();
        setofferingUserList(userOfferingdata || []);

        const requestsResponse = await fetch(
          "http://localhost:5000/api/requests",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal,
          }
        );

        if (!requestsResponse.ok) {
          throw new Error("Failed to fetch User's requests");
        }

        const userRequestingdata = await requestsResponse.json();
        setrequestUserList(userRequestingdata || []);

        const favoriteResponse = await fetch(
          "http://localhost:5000/api/favorites",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }
        );

        if (!favoriteResponse.ok) {
          throw new Error("Failed to fetch favorites");
        }

        const favoriteResponsedata = await favoriteResponse.json();
        setfavoriteOfferList(favoriteResponsedata.favoriteOfferings || []);
        setfavoriteRequestList(favoriteResponsedata.favoriteRequests || []);

        const favoriteIdsResponse = await fetch(
          "http://localhost:5000/api/favorites-ids",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }
        );
        const favoriteIdsdata = await favoriteIdsResponse.json();
        setfavoriteOfferIDList(favoriteIdsdata.favoriteOfferingsID);
        setfavoriteRequestIDList(favoriteIdsdata.favoriteRequestsID);

        const userResponse = await fetch("http://localhost:5000/api/user", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        if (userData.user?.acceptedUserAgreement === false) {
          setShowAgreement(true);
        }
        
        // Set current user ID
        if (userData.user) {
          setCurrentUserId(userData.user.uid);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
          console.error("Error fetching data:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [navigate]);

  const handleAcceptAgreement = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/user/agreement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ acceptedUserAgreement: true }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update agreement: ${response.statusText}`);
      }

      setShowAgreement(false);
      setShowNextPopup(true);
    } catch (error) {
      console.error("Error updating agreement status:", error);
    }
  };

  const handleGoToNextPage = () => {
    setShowNextPopup(false);
    navigate("/extra-userinfo-form");
  };

  const handleDoItLater = () => {
    setShowNextPopup(false);
  };

  const handleRecentViewOptionChange = (option) => {
    setRecentViewOption(option);
  const handleRecentViewOptionChange = (option) => {
    setRecentViewOption(option);
  };

  const handleYourPostViewOptionChange = (option) => {
    setYourPostViewOption(option);
  const handleYourPostViewOptionChange = (option) => {
    setYourPostViewOption(option);
  };

  const handleMobileViewToggle = (view) => {
    setMobileView(view);
  };

  const renderRecentListings = () => (
    <div
      className={`${isMobile ? "w-100" : "col-lg-6 col-md-6"} bg-light text-black p-4 rounded-3 text-center`}
      style={{ minHeight: isMobile ? "auto" : "100vh", overflowY: "auto" }}
    >
      <h3 className="mb-4">Recent Listings</h3>

      <div className="btn-group mb-4" role="group" aria-label="Recent View Options">
        <button
          type="button"
          className={`btn btn-outline-primary ${recentViewOption === "offerings" ? "active" : ""}`}
          onClick={() => handleRecentViewOptionChange("offerings")}
        >
          Offerings
        </button>
        <button
          type="button"
          className={`btn btn-outline-primary ${recentViewOption === "requests" ? "active" : ""}`}
          onClick={() => handleRecentViewOptionChange("requests")}
        >
          Requests
        </button>
        <button
          type="button"
          className={`btn btn-outline-primary ${recentViewOption === "both" ? "active" : ""}`}
          onClick={() => handleRecentViewOptionChange("both")}
        >
          Both
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          {recentViewOption === "offerings" || recentViewOption === "both" ? (
            <div>
              {offeringList.length > 0 ? (
                offeringList.map((offering, index) => (
                  <div className="col-9 mx-auto" key={index}>
                    <OfferingCard offering={offering} userFavorites={favoriteOfferIDList} />
                  </div>
                ))
              ) : (
                <p>No offerings available.</p>
              )}
            </div>
          ) : null}

          {recentViewOption === "requests" || recentViewOption === "both" ? (
            <div>
              {requestList.length > 0 ? (
                requestList.map((request, index) => (
                  <div className="col-9 mx-auto" key={index}>
                    <RequestCard request={request} userFavorites={favoriteRequestIDList} />
                  </div>
                ))
              ) : (
                <p>No requests available.</p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  const renderYourPosts = () => (
    <div
      className={`${isMobile ? "w-100" : "col-lg-6 col-md-6"} bg-white text-black p-4 rounded-3 text-center`}
      style={{ minHeight: isMobile ? "auto" : "100vh", overflowY: "auto" }}
    >
      <h3 className="mb-4">Your Recent Posts</h3>

      <div className="btn-group mb-4" role="group" aria-label="Your Post View Options">
        <button
          type="button"
          className={`btn btn-outline-primary ${yourPostViewOption === "offerings" ? "active" : ""}`}
          onClick={() => handleYourPostViewOptionChange("offerings")}
        >
          Your Offerings
        </button>
        <button
          type="button"
          className={`btn btn-outline-primary ${yourPostViewOption === "requests" ? "active" : ""}`}
          onClick={() => handleYourPostViewOptionChange("requests")}
        >
          Your Requests
        </button>
        <button
          type="button"
          className={`btn btn-outline-primary ${yourPostViewOption === "both" ? "active" : ""}`}
          onClick={() => handleYourPostViewOptionChange("both")}
        >
          Both
        </button>
        <button
          type="button"
          className={`btn btn-outline-warning ${yourPostViewOption === "favorites" ? "active" : ""}`}
          onClick={() => handleYourPostViewOptionChange("favorites")}
        >
          Favorites
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          {yourPostViewOption === "offerings" || yourPostViewOption === "both" ? (
            <div>
              {offeringUserList.length > 0 ? (
                offeringUserList.map((offering, index) => (
                  <div className="col-9 mx-auto" key={index}>
                    <DashboardOfferingCard offering={offering} userFavorites={favoriteOfferIDList} />
                  </div>
                ))
              ) : (
                <p>No offerings available.</p>
              )}
            </div>
          ) : null}

          {yourPostViewOption === "requests" || yourPostViewOption === "both" ? (
            <div>
              {requestUserList.length > 0 ? (
                requestUserList.map((request, index) => (
                  <div className="col-9 mx-auto" key={index}>
                    <DashboardRequestCard request={request} userFavorites={favoriteRequestIDList} />
                  </div>
                ))
              ) : (
                <p>No requests available.</p>
              )}
            </div>
          ) : null}
          
          {yourPostViewOption === "favorites" && (
            <div>
              <h5>Your Favorited Offerings</h5>
              {favoriteOfferList.length > 0 ? (
                favoriteOfferList.map((offering, index) => {
                  // Check if the current user is the owner of this offering
                  const isUserOwner = offering.userid === currentUserId;
                  
                  return (
                    <div className="col-9 mx-auto" key={`fav-offer-${index}`}>
                      {isUserOwner ? (
                        <DashboardOfferingCard offering={offering} userFavorites={favoriteOfferIDList} />
                      ) : (
                        <OfferingCard offering={offering} userFavorites={favoriteOfferIDList} />
                      )}
                    </div>
                  );
                })
              ) : (
                <p>No favorite offerings yet.</p>
              )}
              
              <h5 className="mt-4">Your Favorited Requests</h5>
              {favoriteRequestList.length > 0 ? (
                favoriteRequestList.map((request, index) => {
                  // Check if the current user is the owner of this request
                  const isUserOwner = request.userid === currentUserId;
                  
                  return (
                    <div className="col-9 mx-auto" key={`fav-request-${index}`}>
                      {isUserOwner ? (
                        <DashboardRequestCard request={request} userFavorites={favoriteRequestIDList} />
                      ) : (
                        <RequestCard request={request} userFavorites={favoriteRequestIDList} />
                      )}
                    </div>
                  );
                })
              ) : (
                <p>No favorite requests yet.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderMobileToggle = () => (
    <div className="btn-group w-100 mb-3" role="group" aria-label="Mobile View Toggle">
      <button
        type="button"
        className={`btn ${mobileView === "recent" ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => handleMobileViewToggle("recent")}
      >
        Recent Listings
      </button>
      <button
        type="button"
        className={`btn ${mobileView === "your" ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => handleMobileViewToggle("your")}
      >
        Your Posts
      </button>
    </div>
  );

  return (
    <div className="container-fluid p-0">
      {isMobile && renderMobileToggle()}

      <div className="d-flex flex-wrap vh-100">
        {isMobile ? (
          mobileView === "recent" ? renderRecentListings() : renderYourPosts()
        ) : (
          <>
            {renderRecentListings()}
            {renderYourPosts()}
          </>
        )}
      </div>

      <UserAgreementPopup
        show={showAgreement}
        handleAccept={handleAcceptAgreement}
      />
      <RedirectUserInfoPopup
        show={showNextPopup}
        onConfirm={handleGoToNextPage}
        onSkip={handleDoItLater}
      />
    </div>
  );
}

export default DashboardLayout;
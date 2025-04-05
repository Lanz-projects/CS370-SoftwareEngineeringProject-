import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserAgreementPopup from "../components/UserAgreement";
import RedirectUserInfoPopup from "./RedirectUserInfoPopup";
import OfferingCard from "./OfferingCard"; // Import OfferingCard component
import RequestCard from "./RequestCard"; // Import RequestCard component
import DashboardRequestCard from "./DashboardRequestingCard";
import DashboardOfferingCard from "./DashboardOfferingCard";

function DashboardLayout() {
  const [offeringList, setOfferingList] = useState([]); // State to hold offerings
  const [requestUserList, setrequestUserList] = useState([]); // State to hold requests
  const [offeringUserList, setofferingUserList] = useState([]); // State to hold offerings
  const [requestList, setRequestList] = useState([]); // State to hold requests
  const [favoriteRequestList, setfavoriteRequestList] = useState([]); // State to hold users favorite requests
  const [favoriteOfferList, setfavoriteOfferList] = useState([]); // State to hold users favorite offerings
  const [favoriteOfferIDList, setfavoriteOfferIDList] = useState([]); // State to hold users favorite offerings id
  const [favoriteRequestIDList, setfavoriteRequestIDList] = useState([]); // State to hold users favorite requests id
  const [showAgreement, setShowAgreement] = useState(false);
  const [showNextPopup, setShowNextPopup] = useState(false);
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State to capture any errors
  const [viewOption, setViewOption] = useState("both"); // State to toggle view between offerings and requests
  const [viewPostOption, setViewPostOption] = useState("both"); // Separate view option for posts

  const navigate = useNavigate();

  // Fetching user data and all data (offerings and requests)
  useEffect(() => {
    const abortController = new AbortController(); // Prevent async issues
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
          signal, // Attach the abort signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setOfferingList(data.offerings || []);
        setRequestList(data.requests || []);

        // Fetching offerings for the authenticated user
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
        //console.log(userOfferingdata);
        setofferingUserList(userOfferingdata || []);

        // Fetching requests for the authenticated user
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
        //console.log(userRequestingdata);
        setrequestUserList(userRequestingdata || []);

        // Fetching favorite requests
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
        //console.log(favoriteResponsedata);
        setfavoriteOfferList(favoriteResponsedata.favoriteOfferings || []);
        setfavoriteRequestList(favoriteResponsedata.favoriteRequests || []);

        // Fetching favorite requesting and offering ids
        const favoriteIdsResponse = await fetch(
          "http://localhost:5000/api/favorites-ids",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }
        );
        const favoriteIdsdata = await favoriteIdsResponse.json();
        //console.log(favoriteIdsdata);
        setfavoriteOfferIDList(favoriteIdsdata.favoriteOfferingsID);
        setfavoriteRequestIDList(favoriteIdsdata.favoriteRequestsID);

        // Check if user has accepted the agreement
        const userResponse = await fetch("http://localhost:5000/api/user", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        if (userData.user?.acceptedUserAgreement === false) {
          setShowAgreement(true);
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
      abortController.abort(); // Cleanup function to cancel request if component unmounts
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

  const handleViewOptionChange = (option) => {
    setViewOption(option); // Change the view option based on the user's selection
  };

  const handlePostViewOptionChange = (option) => {
    setViewPostOption(option); // Change the view option for posts separately
  };

  return (
    <div className="container-fluid d-flex vh-100 p-0">
      {/* Recent Listings Section (50%) */}
      <div
        className="col-lg-6 col-md-6 bg-light text-black p-4 rounded-3 text-center"
        style={{ minHeight: "100vh", overflowY: "auto" }}
      >
        <h3 className="mb-4">Recent Listings</h3>

        {/* Toggle Buttons */}
        <div className="btn-group mb-4" role="group" aria-label="View Options">
          <button
            type="button"
            className={`btn btn-outline-primary ${
              viewOption === "offerings" ? "active" : ""
            }`}
            onClick={() => handleViewOptionChange("offerings")}
          >
            Offerings
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${
              viewOption === "requests" ? "active" : ""
            }`}
            onClick={() => handleViewOptionChange("requests")}
          >
            Requests
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${
              viewOption === "both" ? "active" : ""
            }`}
            onClick={() => handleViewOptionChange("both")}
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
            {/* Conditionally render based on viewOption */}
            {viewOption === "offerings" || viewOption === "both" ? (
              <div>
                {offeringList.length > 0 ? (
                  offeringList.map((offering, index) => (
                    <div className="col-9 mx-auto" key={index}>
                      <OfferingCard offering={offering} userFavorites={favoriteOfferIDList}/>
                    </div>
                  ))
                ) : (
                  <p>No offerings available.</p>
                )}
              </div>
            ) : null}

            {viewOption === "requests" || viewOption === "both" ? (
              <div>
                {requestList.length > 0 ? (
                  requestList.map((request, index) => (
                    <div className="col-9 mx-auto" key={index}>
                      <RequestCard request={request} userFavorites={favoriteRequestIDList}/>
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

      {/* Your Recent Posts Section (50%) */}
      <div
        className="col-lg-6 col-md-6 bg-white text-black p-4 rounded-3 text-center"
        style={{ minHeight: "100vh", overflowY: "auto" }}
      >
        <h3 className="mb-4">Your Recent Posts</h3>

        {/* Toggle Buttons for Posts */}
        <div
          className="btn-group mb-4"
          role="group"
          aria-label="Post View Options"
        >
          <button
            type="button"
            className={`btn btn-outline-primary ${
              viewPostOption === "offerings" ? "active" : ""
            }`}
            onClick={() => handlePostViewOptionChange("offerings")}
          >
            Your Offerings
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${
              viewPostOption === "requests" ? "active" : ""
            }`}
            onClick={() => handlePostViewOptionChange("requests")}
          >
            Your Requests
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${
              viewPostOption === "both" ? "active" : ""
            }`}
            onClick={() => handlePostViewOptionChange("both")}
          >
            Both
          </button>
          <button
            type="button"
            className={`btn btn-outline-warning ${
              viewPostOption === "favorites" ? "active" : ""
            }`}
            onClick={() => handlePostViewOptionChange("favorites")}
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
            {/* Conditionally render based on viewPostOption */}
            {viewPostOption === "offerings" || viewPostOption === "both" ? (
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

            {viewPostOption === "requests" || viewPostOption === "both" ? (
              <div>
                {requestUserList.length > 0 ? (
                  requestUserList.map((request, index) => (
                    <div className="col-9 mx-auto" key={index}>
                      <DashboardRequestCard request={request} userFavorites={favoriteRequestIDList}/>
                    </div>
                  ))
                ) : (
                  <p>No requests available.</p>
                )}
              </div>
            ) : null}
            {viewPostOption === "favorites" ? (
              <div>
                <h5>Your Favorited Offerings</h5>
                {favoriteOfferList.length > 0 ? (
                  favoriteOfferList.map((offering, index) => (
                    <div className="col-9 mx-auto" key={`fav-offer-${index}`}>
                      <DashboardOfferingCard offering={offering} userFavorites={favoriteOfferIDList} />
                    </div>
                  ))
                ) : (
                  <p>No favorite offerings yet.</p>
                )}
                {favoriteRequestList.length > 0 ? (
                  favoriteRequestList.map((request, index) => (
                    <div className="col-9 mx-auto" key={`fav-request-${index}`}>
                      {/* Replace with the correct component for displaying requests */}
                      <DashboardRequestCard request={request}  userFavorites={favoriteRequestIDList}/>
                    </div>
                  ))
                ) : (
                  <p>No favorite requests yet.</p>
                )}
              </div>
            ) : null}
          </div>
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

import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserAgreementPopup from "../components/UserAgreement";
import RedirectUserInfoPopup from "./RedirectUserInfoPopup";
import OfferingCard from "./OfferingCard"; // Import OfferingCard component
import RequestCard from "./RequestCard"; // Import RequestCard component

function DashboardLayout() {
  const [recentPosts, setRecentPosts] = useState([]); // State to hold recent posts
  const [offeringList, setOfferingList] = useState([]); // State to hold offerings
  const [requestList, setRequestList] = useState([]); // State to hold requests
  const [showAgreement, setShowAgreement] = useState(false);
  const [showNextPopup, setShowNextPopup] = useState(false);
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State to capture any errors
  const [viewOption, setViewOption] = useState("both"); // State to toggle view between offerings and requests
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

  return (
    <div className="container-fluid d-flex vh-100 p-0">
      {/* Recent Listings Section (50%) */}
      <div className="col-lg-6 col-md-6 bg-light text-black p-4 rounded-3 text-center" style={{ minHeight: "100vh", overflowY: "auto" }}>
        <h3 className="mb-4">Recent Listings</h3>

        {/* Toggle Buttons */}
        <div className="btn-group mb-4" role="group" aria-label="View Options">
          <button
            type="button"
            className={`btn btn-outline-primary ${viewOption === "offerings" ? "active" : ""}`}
            onClick={() => handleViewOptionChange("offerings")}
          >
            Offerings
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${viewOption === "requests" ? "active" : ""}`}
            onClick={() => handleViewOptionChange("requests")}
          >
            Requests
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${viewOption === "both" ? "active" : ""}`}
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
                      <OfferingCard offering={offering} />
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
                      <RequestCard request={request} />
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
      <div className="col-lg-6 col-md-6 bg-white text-black p-4 rounded-3 text-center">
        <h3 className="mb-4">Your Recent Posts</h3>
        {recentPosts.length > 0 ? (
          <ul className="list-unstyled">
            {recentPosts.map((post, index) => (
              <li key={index} className="mb-3">
                <div className="border p-3 rounded-3">
                  <h5>{post.title}</h5>
                  <p>{post.content}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>There are no posts.</p>
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

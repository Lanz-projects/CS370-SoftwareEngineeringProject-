import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserAgreementPopup from "../components/UserAgreement";
import RedirectUserInfoPopup from "./RedirectUserInfoPopup";

function DashboardLayout() {
  const [recentPosts, setRecentPosts] = useState([]); // State to hold recent posts
  const [showAgreement, setShowAgreement] = useState(false);
  const [showNextPopup, setShowNextPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController(); // Prevent async issues
    const signal = abortController.signal;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/api/user", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal, // Attach the abort signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.acceptedUserAgreement === false) {
          setShowAgreement(true);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();

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




  return (
    <div className="container-fluid d-flex vh-100 p-0">
      {/* Recent Listings Section (50%) */}
      <div className="col-lg-6 col-md-6 bg-light text-black p-4 rounded-3 text-center">
        <h3 className="mb-4">Recent Listings</h3>
        <ul className="list-unstyled">
          <li className="mb-3">
            <div className="border p-3 rounded-3">
              <h5>Ride to X Destination</h5>
              <p>Looking for a ride to X. Let me know if you're heading that way!</p>
            </div>
          </li>
          <li className="mb-3">
            <div className="border p-3 rounded-3">
              <h5>Going to Y Place</h5>
              <p>I'm planning to go to Y place. Anyone interested in joining?</p>
            </div>
          </li>
          {/* Add more listings dynamically here */}
        </ul>
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
      <UserAgreementPopup show={showAgreement} handleAccept={handleAcceptAgreement} />
      <RedirectUserInfoPopup show={showNextPopup} onConfirm={handleGoToNextPage} onSkip={handleDoItLater} />
    </div>
  );
};

export default DashboardLayout;

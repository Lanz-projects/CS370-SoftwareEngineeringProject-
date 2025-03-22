import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserAgreementPopup from "../components/UserAgreement";
import RedirectUserInfoPopup from "./RedirectUserInfoPopup";

function DashboardLayout() {
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
    <div className="container mt-5">
      <h2>Welcome to Your Dashboard</h2>
      <UserAgreementPopup show={showAgreement} handleAccept={handleAcceptAgreement} />
      <RedirectUserInfoPopup show={showNextPopup} onConfirm={handleGoToNextPage} onSkip={handleDoItLater} />
    </div>
  );
}

export default DashboardLayout;

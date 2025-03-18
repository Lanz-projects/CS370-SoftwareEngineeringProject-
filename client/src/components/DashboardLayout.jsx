import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserAgreementPopup from "../components/UserAgreement"
import RedirectUserInfoPopup from "./RedirectUserInfoPopup";

function DashboardLayout(){
  const [showAgreement, setShowAgreement] = useState(false); // This checks the state whether to show the User Agreement
  const [showNextPopup, setShowNextPopup] = useState(false); // This checks whether the next popup shows up
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Checks if the user is already logged in by checking if the token is in local storage
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Checks to see if the user has already accepted the User Agreement
        // The user agreement is a boolean that is stored in User collection in the database
        const response = await fetch("http://localhost:5000/api/user", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.acceptedUserAgreement === false) {
          setShowAgreement(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleAcceptAgreement = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Submits if the user has accepeted the user agreement
      await fetch("http://localhost:5000/api/user/agreement", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ acceptedUserAgreement: true }),
      });

      setShowAgreement(false); // Closes the popup  
      setShowNextPopup(true); // Opens the next popup
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

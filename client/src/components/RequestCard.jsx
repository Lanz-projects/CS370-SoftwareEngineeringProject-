import React, { useState, useEffect } from "react";
import { Card, Button, Modal } from "react-bootstrap";
import { Star, Person, StarFill, Lock, Unlock } from "react-bootstrap-icons";

const RequestCard = ({ request, userFavorites, onAcceptComplete }) => {
  const { name, location, arrivaldate, notes, wants, userid, _id, userAccepted } = request;
  const [showProfile, setShowProfile] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showUnacceptConfirmation, setShowUnacceptConfirmation] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Extract destination name from location object if available
  const destination = location?.formattedAddress || `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;

  // Check if this request is favorited
  const isFavoritedStatus = userFavorites?.includes(_id) || false;
  
  // Check if request is already accepted
  const isAccepted = !!userAccepted;
  
  // Check if current user is the one who accepted it
  const isAcceptedByCurrentUser = userAccepted === currentUserId;

  // Fetch current user's ID on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.error("No token found in local storage");
          return;
        }
        
        const response = await fetch("http://localhost:5000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.user.uid);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/request/${_id}`);
      const data = await response.json();
      if (data.request) {
        setUserProfile(data.request.user);
        setShowProfile(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Handle the "star" button click to favorite a request
  const handleFavorite = async () => {
    try {
      const token = localStorage.getItem("token");

      const url = isFavoritedStatus
        ? "http://localhost:5000/api/user/remove-favorite"
        : "http://localhost:5000/api/user/favorite-request";

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: _id,
          type: "request", 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Request favorite status updated:", data.message);
        if (onAcceptComplete) onAcceptComplete(); 
      } else {
        console.error("Error updating favorite status:", data.error);
      }
    } catch (error) {
      console.error("Error updating favorite status", error);
    }
  };

  // Handle the "Accept" button click
  const handleAccept = () => {
    setShowConfirmation(true);
  };

  // Handle the "Unaccept" button click
  const handleUnaccept = () => {
    setShowUnacceptConfirmation(true);
  };

  // Handle the "Confirm" button click to accept the request
  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const acceptResponse = await fetch(
        `http://localhost:5000/api/accept-request/${_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );

      const acceptData = await acceptResponse.json();
      
      if (acceptResponse.ok) {
        if (!isFavoritedStatus) {
          await fetch(
            "http://localhost:5000/api/user/favorite-request",
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                requestId: _id,
                type: "request", 
              }),
            }
          );
          window.location.reload();
        }
        
        console.log("Request accepted successfully:", acceptData.message);
        setShowConfirmation(false);
        if (onAcceptComplete) onAcceptComplete();
      } else {
        console.error("Error accepting request:", acceptData.error);
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error("Error in accept process:", error);
      setShowConfirmation(false);
    }
  };

  // Handle the "Confirm Unaccept" button click
  const handleConfirmUnaccept = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const unacceptResponse = await fetch(
        `http://localhost:5000/api/unaccept-request/${_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );

      const unacceptData = await unacceptResponse.json();
      
      if (unacceptResponse.ok) {
        if (isFavoritedStatus) {
          await fetch(
            "http://localhost:5000/api/user/remove-favorite",
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                requestId: _id,
                type: "request", 
              }),
            }
          );
          window.location.reload();
        }
        
        console.log("Request unaccepted successfully:", unacceptData.message);
        setShowUnacceptConfirmation(false);
        if (onAcceptComplete) onAcceptComplete();
      } else {
        console.error("Error unaccepting request:", unacceptData.error);
        setShowUnacceptConfirmation(false);
      }
    } catch (error) {
      console.error("Error in unaccept process:", error);
      setShowUnacceptConfirmation(false);
    }
  };

  return (
    <>
      <Card className="mb-3 position-relative p-3 shadow-sm rounded">
        {/* Star Button - Top Right */}
        <Button
          variant="outline-warning"
          className="position-absolute top-0 end-0 m-2 p-1 border-0"
          onClick={handleFavorite} 
        >
          {isFavoritedStatus ? (
            <StarFill size={20} color="gold" />
          ) : (
            <Star size={20} color="gray" />
          )}
        </Button>

        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <Card.Title>{name}</Card.Title>
            <Button
              variant="outline-primary"
              className="border-0"
              onClick={fetchUserProfile}
            >
              <Person size={20} /> Profile
            </Button>
          </div>

          <Card.Subtitle className="mb-2 text-muted">
            Request for a ride
          </Card.Subtitle>
          <Card.Text>
            <strong>Location: </strong>
            {destination}
          </Card.Text>
          <Card.Text>
            <strong>Arrival Date: </strong>
            {new Date(arrivaldate).toLocaleDateString()}
          </Card.Text>
          <Card.Text>
            <strong>Notes: </strong>
            {notes || "No additional notes."}
          </Card.Text>
          {wants && (
            <Card.Text>
              <strong>Wants: </strong>
              {wants}
            </Card.Text>
          )}
        </Card.Body>

        <Card.Footer className="bg-white border-0 text-center">
          {isAccepted ? (
            isAcceptedByCurrentUser ? (
              <Button variant="warning" className="w-100" onClick={handleUnaccept}>
                <Unlock size={16} className="me-1" /> Unaccept
              </Button>
            ) : (
              <Button variant="secondary" className="w-100" disabled>
                <Lock size={16} className="me-1" /> Already Accepted
              </Button>
            )
          ) : (
            <Button variant="success" className="w-100" onClick={handleAccept}>
              Accept
            </Button>
          )}
        </Card.Footer>
      </Card>

      {/* Profile Modal */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {userProfile ? userProfile.name : "Loading..."}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userProfile ? (
            <>
              <div className="mb-3 p-2 border rounded">
                <strong>Name:</strong> {userProfile.name}
              </div>
              <div className="mb-3 p-2 border rounded">
                <strong>Email:</strong> {userProfile.email}
              </div>
              <div className="mb-3 p-2 border rounded">
                <strong>Contact Info:</strong>
                {userProfile.contactInfo?.length > 0 ? (
                  <ul>
                    {userProfile.contactInfo.map((info, index) => (
                      <li key={index}>
                        <strong>{info.type}:</strong> {info.value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No contact information available</p>
                )}
              </div>
              <div className="mb-3 p-2 border rounded">
                <strong>Vehicle Info:</strong>{" "}
                {userProfile.vehicleid
                  ? `${userProfile.vehicleid.make} ${userProfile.vehicleid.model}`
                  : "No vehicle assigned"}
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfile(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Accept Confirmation Modal */}
      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Acceptance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Click confirm and the requester will be notified that you took on their request. This will also show up in your favorites on the dashboard.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Unaccept Confirmation Modal */}
      <Modal show={showUnacceptConfirmation} onHide={() => setShowUnacceptConfirmation(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Unaccept</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to unaccept this request? The requester will be notified, and it will be removed from your favorites.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUnacceptConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleConfirmUnaccept}>
            Confirm Unaccept
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RequestCard;
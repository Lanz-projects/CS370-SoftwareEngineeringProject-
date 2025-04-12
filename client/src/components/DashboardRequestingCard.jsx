import React, { useState, useEffect } from "react";
import { Card, Button, Modal } from "react-bootstrap";
import { Star, Person, StarFill, Lock, Unlock } from "react-bootstrap-icons";

const DashboardRequestCard = ({ request, userFavorites }) => {
  const {
    name,
    location,
    arrivaldate,
    arrivaltime,
    notes,
    wants,
    _id,
    userid,
    userAccepted,
  } = request;
  const [showProfile, setShowProfile] = useState(false);
  const [showUnacceptConfirmation, setShowUnacceptConfirmation] =
    useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isOwnPost, setIsOwnPost] = useState(false);

  const locationString = `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;
  const isFavorited = userFavorites.includes(_id);

  // Check if request is accepted and if it's accepted by the current user
  const isAccepted = !!userAccepted;
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
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.user.uid);

          // Check if this post belongs to the current user
          setIsOwnPost(userData.user.uid === userid);
          //setIsOwnPost(false);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, [userid]);

  // Handle the "star" button click
  const handleFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = isFavorited
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
        window.location.reload(); // Refresh to show changes
      } else {
        console.error("Error updating favorite status:", data.error);
      }
    } catch (error) {
      console.error("Error updating favorite status", error);
    }
  };

  // Handle the "Cancel" button click (delete request)
  const handleCancel = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/delete-request/${_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Request deleted successfully:", data.message);
        window.location.reload();
      } else {
        console.error("Error deleting request:", data.error);
      }
    } catch (error) {
      console.error("Error deleting request", error);
    }
  };

  // Handle the "Unaccept" button click
  const handleUnaccept = () => {
    setShowUnacceptConfirmation(true);
  };

  // Handle confirmation of unaccepting
  const handleConfirmUnaccept = async () => {
    try {
      const token = localStorage.getItem("token");

      // Update the request to remove acceptance
      const unacceptResponse = await fetch(
        `http://localhost:5000/api/unaccept-request/${_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const unacceptData = await unacceptResponse.json();

      if (unacceptResponse.ok) {
        // Remove from favorites if currently favorited
        if (isFavorited) {
          await fetch("http://localhost:5000/api/user/remove-favorite", {
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
        }

        console.log("Request unaccepted successfully:", unacceptData.message);

        // Close unaccept confirmation modal
        setShowUnacceptConfirmation(false);

        // Refresh the page to show changes
        window.location.reload();
      } else {
        console.error("Error unaccepting request:", unacceptData.error);
        setShowUnacceptConfirmation(false);
      }
    } catch (error) {
      console.error("Error in unaccept process:", error);
      setShowUnacceptConfirmation(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/request/${_id}`);
      const data = await response.json();
      if (data.request) {
        setUserProfile(data.request.user);
        setShowProfile(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Determine which button to show in the footer
  const renderFooterButton = () => {
    if (isOwnPost) {
      // If it's the user's own post, always show Cancel button
      return (
        <Button variant="danger" className="w-100" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (isAccepted) {
      // For accepted posts that aren't the user's own
      //console.log("isAccepted:", isAccepted);
      //console.log("isAcceptedByCurrentUser:", isAcceptedByCurrentUser);
      if (isAcceptedByCurrentUser) {
        // Show Unaccept button if current user is the one who accepted it
        return (
          <Button variant="warning" className="w-100" onClick={handleUnaccept}>
            <Unlock size={16} className="me-1" /> Unaccept
          </Button>
        );
      } else {
        // Show disabled button if someone else accepted it
        return (
          <Button variant="secondary" className="w-100" disabled>
            <Lock size={16} className="me-1" /> Already Accepted
          </Button>
        );
      }
    } else {
      // Default case - no one has accepted it yet and it's not user's own post
      return (
        <Button variant="success" className="w-100" disabled>
          Not Accepted
        </Button>
      );
    }
  };

  function convertTo12HourFormat(arrivalTime) {
    if (!arrivalTime) return;

    const [hours, minutes] = arrivalTime.split(":").map(Number);

    // Convert to 12-hour format
    let hour12 = hours % 12; // Get hour in 12-hour format
    const amPm = hours >= 12 ? "PM" : "AM"; // Determine AM/PM
    hour12 = hour12 === 0 ? 12 : hour12; // Handle midnight (00:xx -> 12:xx)

    // Format minutes as a two-digit string
    const formattedMinutes = String(minutes).padStart(2, "0");

    // Return formatted time in 12-hour format
    return `${hour12}:${formattedMinutes} ${amPm}`;
  }

  return (
    <>
      <Card className="mb-3 position-relative p-3 shadow-sm rounded">
        <Button
          variant="outline-warning"
          className="position-absolute top-0 end-0 m-2 p-1 border-0"
          onClick={handleFavorite}
        >
          {isFavorited ? (
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
            <strong>Destination: </strong>
            {locationString}
          </Card.Text>
          <Card.Text>
            <strong>Arrival Date: </strong>
            {new Date(arrivaldate).toLocaleDateString()}
          </Card.Text>
          <Card.Text>
            <strong>Arrival Time: </strong>
            {convertTo12HourFormat(arrivaltime)}
          </Card.Text>
          <Card.Text>
            <strong>Notes: </strong>
            {notes || "No additional notes."}
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
          {renderFooterButton()}
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
              <div className="mb-2 p-2 border rounded">
                <div className="fw-bold mb-1">Name</div>
                <div>{userProfile.name}</div>
              </div>

              <div className="mb-2 p-2 border rounded">
                <div className="fw-bold mb-1">Email</div>
                <div>{userProfile.email}</div>
              </div>

              <div className="mb-2 p-2 border rounded">
                <div className="fw-bold mb-1">Contact</div>
                {userProfile.contactInfo?.length ? (
                  <ul>
                    {userProfile.contactInfo.map((info, idx) => (
                      <li key={idx}>
                        <strong>{info.type}:</strong> {info.value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No contact information available</p>
                )}
              </div>

              <div className="mb-2 p-2 border rounded">
                <div className="fw-bold mb-1">Vehicle Info</div>
                <div>
                  {userProfile.vehicleid
                    ? `${userProfile.vehicleid.make} ${userProfile.vehicleid.model}`
                    : "No vehicle assigned"}
                </div>
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

      {/* Unaccept Confirmation Modal */}
      <Modal
        show={showUnacceptConfirmation}
        onHide={() => setShowUnacceptConfirmation(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Unaccept</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to unaccept this request? The requester will
            be notified, and it will be removed from your favorites.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUnacceptConfirmation(false)}
          >
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

export default DashboardRequestCard;

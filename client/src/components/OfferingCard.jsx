import React, { useState, useEffect } from "react";
import { Card, Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Star, Person, People, StarFill, GeoAlt, Calendar, Clock, FileText, XCircle } from "react-bootstrap-icons";
import RequestToRideModal from "./RequestToRideModal";

const OfferingCard = ({ offering, userFavorites = [], onUpdateOffering }) => {
  const {
    _id,
    name,
    location = {},
    arrivaldate,
    arrivaltime,
    vehicleid,
    notes,
    userid,
    maxSeats = 0,
    originalMaxSeats,
    waitingList = [],
    acceptedUsers = [],
  } = offering || {};
  
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");
  const [showFullNotes, setShowFullNotes] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if the offering is in user's favorites
  const isFavorited = Array.isArray(userFavorites) ? userFavorites.includes(_id) : false;
    
  // Check if current user is the author of the offering
  const isCurrentUserAuthor = userid === currentUserId;
  
  // Check if current user is already in the waiting list
  const isUserInWaitingList = React.useMemo(() => {
    if (!currentUserId || !Array.isArray(waitingList)) return false;
    
    return waitingList.some(item => 
      // Check for various possible structures
      item === currentUserId || 
      item.userId === currentUserId || 
      item.user === currentUserId ||
      (item.user && item.user._id === currentUserId) ||
      item._id === currentUserId
    );
  }, [waitingList, currentUserId]);
  
  // Check if current user is in accepted users list
  const isUserAccepted = React.useMemo(() => {
    if (!currentUserId || !Array.isArray(acceptedUsers)) return false;
    
    return acceptedUsers.some(item => 
      item === currentUserId || 
      item.userId === currentUserId || 
      item.user === currentUserId ||
      (item.user && item.user._id === currentUserId) ||
      item._id === currentUserId
    );
  }, [acceptedUsers, currentUserId]);


  // Determine if the user can request ride
  const canRequestRide = !isCurrentUserAuthor && !isUserInWaitingList && !isUserAccepted && maxSeats > 0;

  // Can cancel if user is in waiting list or accepted
  const canCancelRequest = !isCurrentUserAuthor && (isUserInWaitingList || isUserAccepted);

  // Get button text based on user status
  const getButtonText = () => {
    if (isCurrentUserAuthor) return "Your Own Offering";
    if (isUserAccepted) return "You're Accepted";
    if (isUserInWaitingList) return "In Waiting List";
    if (maxSeats === 0) return "No Seats Available";
    return "Request to Ride";
  };

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
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Truncate longer text like in DashboardOfferingCard
  const truncateText = (text, maxLength = 80) => {
    if (!text) return "No additional notes.";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Extract coordinates into more usable format
  const formatLocation = () => {
    if (location?.formattedAddress) return location.formattedAddress;
    if (location?.coordinates) {
      return `${location.coordinates[0].toFixed(4)}, ${location.coordinates[1].toFixed(4)}`;
    }
    return "Location not specified";
  };

  // Handle the "star" button click to favorite an offering
  const handleFavorite = async (e) => {
    e && e.stopPropagation(); // Prevent card click event if event exists
    try {
      const token = localStorage.getItem("token");
      const url = isFavorited
        ? "http://localhost:5000/api/user/remove-favorite"
        : "http://localhost:5000/api/user/favorite-offering";

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offeringId: _id,
          type: "offering",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Offering favorite status updated:", data.message);
        if (onUpdateOffering) onUpdateOffering();
        window.location.reload();
      } else {
        console.error("Error updating favorite status:", data.error);
      }
    } catch (error) {
      console.error("Error updating favorite status", error);
    }
  };

  // Remove from favorites (similar to RequestCard's functionality)
  const removeFavorite = async () => {
    if (!isFavorited) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/user/remove-favorite", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offeringId: _id,
          type: "offering",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Offering removed from favorites:", data.message);
      } else {
        console.error("Error removing from favorites:", data.error);
      }
    } catch (error) {
      console.error("Error removing from favorites", error);
    }
  };

  // Fetch profile modal
  const fetchUserProfile = async (e) => {
    e && e.stopPropagation(); // Prevent card click event if event exists
    try {
      const response = await fetch(`http://localhost:5000/api/offering/${_id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.offering) {
        setUserProfile(data.offering.user);
        setShowProfile(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Handle cancellation of ride request
  const handleCancelRequest = async () => {
    if (!currentUserId || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        setIsProcessing(false);
        return;
      }
      
      // Determine if user is in waiting list or accepted users
      const endpoint = isUserAccepted 
        ? `/api/offering/${_id}/cancel-accepted-user`
        : `/api/offering/${_id}/cancel-waitlist-request`;
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log("Successfully canceled request:", data.message);
        
        // If the offering is favorited, unfavorite it
        if (isFavorited) {
          await removeFavorite();
        }
        
        window.location.reload();
      } else {
        console.error("Error canceling request:", data.error);
      }
    } catch (error) {
      console.error("Error canceling request:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  function convertTo12HourFormat(arrivalTime) {
    if (!arrivalTime) return;

    const [hours, minutes] = arrivalTime.split(":").map(Number);
    let hour12 = hours % 12;
    const amPm = hours >= 12 ? "PM" : "AM";
    hour12 = hour12 === 0 ? 12 : hour12;
    const formattedMinutes = String(minutes).padStart(2, "0");
    return `${hour12}:${formattedMinutes} ${amPm}`;
  }

  // Handle successful request to ride
  const handleSuccessfulRequest = () => {
    // If not favorited, add to favorites then reload
    if (!isFavorited) {
      handleFavorite();
    } else {
      window.location.reload();
    }
  };

  if (!offering) {
    return <Card className="mb-3 p-3">No offering data available</Card>;
  }

  return (
    <>
      <Card className="mb-3 position-relative shadow-sm rounded">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-2">
          <div className="text-truncate pe-2" style={{ maxWidth: "80%" }}>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{name}</Tooltip>}
              trigger={['hover', 'focus']}
            >
              <h5 className="mb-0 fw-bold text-truncate">{name}</h5>
            </OverlayTrigger>
          </div>
          <div className="d-flex">
            <Button
              variant="outline-primary"
              size="sm"
              className="me-1 border-0"
              onClick={fetchUserProfile}
            >
              <Person size={18} />
            </Button>
            <Button
              variant="outline-warning"
              size="sm"
              className="border-0"
              onClick={handleFavorite}
            >
              {isFavorited ? (
                <StarFill size={18} color="gold" />
              ) : (
                <Star size={18} color="gray" />
              )}
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="py-2">
          <div className="medium text-muted mb-2">Offering a ride to:</div>
          
          <div className="d-flex align-items-center mb-2">
            <GeoAlt className="me-2 text-secondary" size={16} />
            <div className="text-truncate">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{formatLocation()}</Tooltip>}
              >
                <span className="small">{formatLocation()}</span>
              </OverlayTrigger>
            </div>
          </div>
          
          <div className="d-flex align-items-center mb-2">
            <Calendar className="me-2 text-secondary" size={16} />
            <span className="small">{new Date(arrivaldate).toLocaleDateString()}</span>
          </div>
          
          <div className="d-flex align-items-center mb-2">
            <Clock className="me-2 text-secondary" size={16} />
            <span className="small">{convertTo12HourFormat(arrivaltime)}</span>
          </div>
          
          <div className="d-flex mb-2">
            <FileText className="me-2 text-secondary flex-shrink-0 mt-1" size={16} />
            <div>
              {notes && notes.length > 80 ? (
                <div className="small">
                  {showFullNotes ? notes : truncateText(notes)}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 ms-1" 
                    onClick={() => setShowFullNotes(!showFullNotes)}
                  >
                    {showFullNotes ? "Show less" : "Show more"}
                  </Button>
                </div>
              ) : (
                <span className="small">{truncateText(notes)}</span>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="d-flex align-items-center">
              <Person className="me-1 text-primary" size={16} />
              <span className="small fw-bold">{maxSeats} / {originalMaxSeats || maxSeats} Available Seats</span>
            </div>
            <div className="d-flex align-items-center">
              <People className="me-1 text-secondary" size={16} />
              <span className="small fw-bold">{waitingList.length} waiting</span>
            </div>
          </div>
        </Card.Body>

        <Card.Footer className="bg-white border-0 p-2">
          <div className="d-flex">
            <Button
              variant={canRequestRide ? "primary" : "secondary"}
              size="sm"
              className={canCancelRequest ? "w-75 me-1" : "w-100"}
              onClick={() => canRequestRide && setShowRequestModal(true)}
              disabled={!canRequestRide}
            >
              {getButtonText()}
            </Button>
            
            {canCancelRequest && (
              <Button
                variant="danger"
                size="sm"
                className="w-25"
                onClick={handleCancelRequest}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    Cancel
                  </>
                )}
              </Button>
            )}
          </div>
        </Card.Footer>
      </Card>

      {/* Profile Modal */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5">
            {userProfile ? userProfile.name : "Loading..."}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userProfile ? (
            <>
              <div className="mb-2 p-2 border rounded">
                <div className="fw-bold mb-1 small">Name</div>
                <div className="text-break">{userProfile.name}</div>
              </div>

              <div className="mb-2 p-2 border rounded">
                <div className="fw-bold mb-1 small">Email</div>
                <div className="text-break">{userProfile.email}</div>
              </div>

              <div className="mb-2 p-2 border rounded">
                <div className="fw-bold mb-1 small">Contact</div>
                {userProfile.contactInfo?.length ? (
                  <ul className="ps-3 mb-0">
                    {userProfile.contactInfo.map((info, idx) => (
                      <li key={idx} className="text-break">
                        <strong>{info.type}:</strong> {info.value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-0">No contact information available</p>
                )}
              </div>

              <div className="mb-2 p-2 border rounded">
                <div className="fw-bold mb-1 small">Vehicle Info</div>
                <div className="text-break">
                  {userProfile.vehicleid
                    ? `${userProfile.vehicleid.color} ${userProfile.vehicleid.make} ${userProfile.vehicleid.model}`
                    : "No vehicle assigned"}
                </div>
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowProfile(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <RequestToRideModal
        show={showRequestModal}
        handleClose={() => {
          setShowRequestModal(false);
          // After successfully submitting a request, update UI and auto-favorite
          handleSuccessfulRequest();
        }}
        quickMessage={quickMessage}
        setQuickMessage={setQuickMessage}
        offeringId={_id}
      />
    </>
  );
};

export default OfferingCard;
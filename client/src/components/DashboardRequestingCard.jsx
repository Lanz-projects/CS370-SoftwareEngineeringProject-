import React, { useState, useEffect } from "react";
import { Card, Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Star, Person, StarFill, Lock, Unlock, GeoAlt, Calendar, Clock, FileText } from "react-bootstrap-icons";

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
  const [showUnacceptConfirmation, setShowUnacceptConfirmation] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isOwnPost, setIsOwnPost] = useState(false);
  const [showFullNotes, setShowFullNotes] = useState(false);
  const [showFullWants, setShowFullWants] = useState(false);

  const isFavorited = userFavorites.includes(_id);
  const isAccepted = !!userAccepted;
  const isAcceptedByCurrentUser = userAccepted === currentUserId;

  // Truncate longer text
  const truncateText = (text, maxLength = 80) => {
    if (!text) return "No additional information.";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Format location to be more readable
  const formatLocation = () => {
    return `${location.coordinates[0].toFixed(4)}, ${location.coordinates[1].toFixed(4)}`;
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
          setIsOwnPost(userData.user.uid === userid);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, [userid]);

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
        window.location.reload();
      } else {
        console.error("Error updating favorite status:", data.error);
      }
    } catch (error) {
      console.error("Error updating favorite status", error);
    }
  };

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
        window.location.reload();
      } else {
        console.error("Error deleting request:", data.error);
      }
    } catch (error) {
      console.error("Error deleting request", error);
    }
  };

  const handleUnaccept = () => {
    setShowUnacceptConfirmation(true);
  };

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
          },
        }
      );

      const unacceptData = await unacceptResponse.json();

      if (unacceptResponse.ok) {
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
        setShowUnacceptConfirmation(false);
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
      return (
        <Button variant="danger" size="sm" className="w-100" onClick={handleCancel}>
          Cancel
        </Button>
      );
    } else if (isAccepted) {
      if (isAcceptedByCurrentUser) {
        return (
          <Button variant="warning" size="sm" className="w-100" onClick={handleUnaccept}>
            <Unlock size={16} className="me-1" /> Unaccept
          </Button>
        );
      } else {
        return (
          <Button variant="secondary" size="sm" className="w-100" disabled>
            <Lock size={16} className="me-1" /> Already Accepted
          </Button>
        );
      }
    } else {
      return (
        <Button variant="success" size="sm" className="w-100" disabled>
          Not Accepted
        </Button>
      );
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
          <div className="small text-muted mb-2">Request for a ride</div>
          
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
          
          {wants && (
            <div className="d-flex mb-2">
              <FileText className="me-2 text-secondary flex-shrink-0 mt-1" size={16} />
              <div>
                {wants.length > 80 ? (
                  <div className="small">
                    <strong>Wants: </strong>
                    {showFullWants ? wants : truncateText(wants)}
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 ms-1" 
                      onClick={() => setShowFullWants(!showFullWants)}
                    >
                      {showFullWants ? "Show less" : "Show more"}
                    </Button>
                  </div>
                ) : (
                  <span className="small"><strong>Wants: </strong>{truncateText(wants)}</span>
                )}
              </div>
            </div>
          )}
          
          {isAccepted && (
            <div className="alert alert-success py-1 px-2 mb-0 mt-2 small">
              <Lock size={12} className="me-1" /> 
              {isAcceptedByCurrentUser ? "You've accepted this request" : "Request accepted by another user"}
            </div>
          )}
        </Card.Body>

        <Card.Footer className="bg-white border-0 p-2">
          {renderFooterButton()}
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
          <Button variant="secondary" size="sm" onClick={() => setShowProfile(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Unaccept Confirmation Modal */}
      <Modal
        show={showUnacceptConfirmation}
        onHide={() => setShowUnacceptConfirmation(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title className="h5">Confirm Unaccept</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small mb-0">
            Are you sure you want to unaccept this request? The requester will
            be notified, and it will be removed from your favorites.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowUnacceptConfirmation(false)}
          >
            Cancel
          </Button>
          <Button variant="warning" size="sm" onClick={handleConfirmUnaccept}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DashboardRequestCard;
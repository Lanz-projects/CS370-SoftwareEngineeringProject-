import React, { useEffect, useState } from "react";
import { Modal, Button, ListGroup, Nav, Alert, Badge } from "react-bootstrap";

const CombinedWaitlistModal = ({ offeringId, showModal, handleCloseModal }) => {
  const [waitlistedUsers, setWaitlistedUsers] = useState([]);
  const [acceptedUsers, setAcceptedUsers] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [waitlistQuickMessages, setWaitlistQuickMessages] = useState({});
  const [acceptedQuickMessages, setAcceptedQuickMessages] = useState({});
  const [activeTab, setActiveTab] = useState("waitlist");
  const [availableSeats, setAvailableSeats] = useState(0);
  const [maxSeats, setMaxSeats] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchWaitlist();
      fetchAcceptedUsers();
    }
  }, [offeringId, showModal]);

  const fetchWaitlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in local storage.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/offering/${offeringId}/waitlist`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setWaitlistedUsers(data.waitingList);
      setWaitlistQuickMessages(data.quickMessages || {});
    } catch (error) {
      console.error("Error fetching waitlist users:", error);
    }
  };

  const fetchAcceptedUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in local storage.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/offering/${offeringId}/accepted-users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setAcceptedUsers(data.acceptedUsers);
      setAcceptedQuickMessages(data.quickMessages || {});
      setAvailableSeats(data.availableSeats);
      
      // Store the max capacity for better visual feedback
      if (data.totalSeats !== undefined) {
        setMaxSeats(data.totalSeats);
      } else {
        // Calculate max seats if not provided directly
        setMaxSeats(data.availableSeats + data.acceptedUsers.length);
      }
    } catch (error) {
      console.error("Error fetching accepted users:", error);
    }
  };

  const handleProfileClick = (user) => {
    setUserProfile(user);
    setShowProfile(true);
  };

  const handleAcceptUser = async (userId) => {
    if (availableSeats <= 0) {
      alert("No available seats left!");
      return;
    }
    
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found in local storage.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/offering/${offeringId}/accept-user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        
        // Optimistically update the UI
        const updatedWaitlist = waitlistedUsers.filter(user => user.uid !== userId);
        setWaitlistedUsers(updatedWaitlist);
        
        // Find the user that was accepted
        const acceptedUser = waitlistedUsers.find(user => user.uid === userId);
        if (acceptedUser) {
          setAcceptedUsers(prev => [...prev, acceptedUser]);
        }
        
        // Update available seats immediately
        setAvailableSeats(prev => Math.max(0, prev - 1));

        window.location.reload();
      } else {
        alert(data.error + (data.details ? `: ${data.details}` : ""));
        // Refresh data to ensure consistency
        fetchWaitlist();
        fetchAcceptedUsers();
      }
    } catch (error) {
      console.error("Error moving user to accepted:", error);
      alert("An error occurred. Please try again.");
      // Refresh data to ensure consistency
      fetchWaitlist();
      fetchAcceptedUsers();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveAcceptedUser = async (userId) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found in local storage.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/offering/${offeringId}/remove-accepted-user`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user: userId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        
        // Optimistically update the UI
        setAcceptedUsers(prev => prev.filter(user => user.uid !== userId));
        
        // Update available seats immediately
        setAvailableSeats(prev => prev + 1);
        window.location.reload();
      } else {
        console.error("Error removing user from accepted:", data.error);
        alert("An error occurred while removing the user.");
        // Refresh data to ensure consistency
        fetchAcceptedUsers();
      }
    } catch (error) {
      console.error("Error removing user from accepted:", error);
      alert("An error occurred. Please try again.");
      // Refresh data to ensure consistency
      fetchAcceptedUsers();
    } finally {
      setIsUpdating(false);
    }
  };

  // Get color for seat availability indicator
  const getSeatStatusColor = () => {
    if (availableSeats === 0) return "danger";
    if (availableSeats <= Math.ceil(maxSeats * 0.2)) return "warning";
    return "success";
  };

  // Get text for seat availability indicator
  const getSeatStatusText = () => {
    if (availableSeats === 0) return "No seats available";
    if (availableSeats <= Math.ceil(maxSeats * 0.2)) return "Limited seats";
    return "Seats available";
  };

  return (
    <>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {activeTab === "waitlist" ? "Waitlisted Users" : "Accepted Users"}
          </Modal.Title>
        </Modal.Header>
        
        <Nav variant="tabs" className="px-3 pt-2">
          <Nav.Item>
            <Nav.Link 
              active={activeTab === "waitlist"} 
              onClick={() => setActiveTab("waitlist")}
            >
              Waitlist {waitlistedUsers.length > 0 && 
                <Badge bg="secondary" className="ms-1">{waitlistedUsers.length}</Badge>}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === "accepted"} 
              onClick={() => setActiveTab("accepted")}
            >
              Accepted Users {acceptedUsers.length > 0 && 
                <Badge bg="secondary" className="ms-1">{acceptedUsers.length}</Badge>}
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Alert variant={getSeatStatusColor()} className="mb-0 py-2 px-3 d-flex align-items-center">
              <strong>Available Seats: {availableSeats}</strong> 
              <Badge bg={getSeatStatusColor()} className="ms-2">{getSeatStatusText()}</Badge>
            </Alert>
            
            <div className="text-muted">
              Total Capacity: {maxSeats}
            </div>
          </div>
          
          {isUpdating && (
            <Alert variant="info" className="py-2">
              Updating...
            </Alert>
          )}
          
          {activeTab === "waitlist" ? (
            <ListGroup>
              {waitlistedUsers.length > 0 ? (
                waitlistedUsers.map((user) => (
                  <ListGroup.Item
                    key={user._id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>{user.name}</span>
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleProfileClick(user)}
                      >
                        Profile
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleAcceptUser(user.uid)}
                        disabled={availableSeats <= 0 || isUpdating}
                      >
                        Accept
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <p className="text-center my-3">No users in waitlist</p>
              )}
            </ListGroup>
          ) : (
            <ListGroup>
              {acceptedUsers.length > 0 ? (
                acceptedUsers.map((user) => (
                  <ListGroup.Item
                    key={user._id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>{user.name}</span>
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleProfileClick(user)}
                      >
                        Profile
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleRemoveAcceptedUser(user.uid)}
                        disabled={isUpdating}
                      >
                        Remove
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <p className="text-center my-3">No accepted users</p>
              )}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>

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
              
              {/* Display Quick Message based on current tab/user type */}
              {userProfile && userProfile.uid && (
                <>
                  {activeTab === "waitlist" && waitlistQuickMessages[userProfile.uid] && (
                    <div className="mt-3 p-2 border rounded bg-light">
                      <div className="fw-bold mb-1">Quick Message (Waitlist)</div>
                      <p className="mb-0">{waitlistQuickMessages[userProfile.uid].message}</p>
                    </div>
                  )}
                  
                  {activeTab === "accepted" && acceptedQuickMessages[userProfile.uid] && (
                    <div className="mt-3 p-2 border rounded bg-light">
                      <div className="fw-bold mb-1">Quick Message (Accepted)</div>
                      <p className="mb-0">{acceptedQuickMessages[userProfile.uid].message}</p>
                    </div>
                  )}
                </>
              )}
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
    </>
  );
};

export default CombinedWaitlistModal;
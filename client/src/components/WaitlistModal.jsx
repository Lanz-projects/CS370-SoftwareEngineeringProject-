import React, { useEffect, useState } from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";

const WaitlistModal = ({ offeringId, showModal, handleCloseModal }) => {
  const [waitlistedUsers, setWaitlistedUsers] = useState([]);
  const [acceptedUsers, setAcceptedUsers] = useState([]); // Store accepted users
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [quickMessages, setQuickMessages] = useState({});

  useEffect(() => {
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
        setQuickMessages(data.quickMessages || {}); // Assuming the response has quickMessages
      } catch (error) {
        console.error("Error fetching waitlist users:", error);
      }
    };

    if (showModal) {
      fetchWaitlist();
    }
  }, [offeringId, showModal]);

  const handleProfileClick = (user) => {
    setUserProfile(user);
    setShowProfile(true);
  };

  const handleCheckmarkClick = async (userId) => {
    console.log(`Checked off user with ID: ${userId}`);
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
        console.log(data.message); // Successfully moved user to accepted
        // Update the state to reflect changes
        setWaitlistedUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );
        alert("User has been accepeted.");
      } else {
        //console.error("Error moving user to accepted:", data.error);
        alert("Either the user isn't in the waitlist or they are in the accepted list.")
      }
    } catch (error) {
      //console.error("Error moving user to accepted:", error);
    }
  };

  return (
    <>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Waitlisted Users</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {waitlistedUsers.map((user) => (
              <ListGroup.Item
                key={user._id}
                className="d-flex justify-content-between"
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
                    onClick={() => handleCheckmarkClick(user.uid)}
                  >
                    ✔️
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      {/* 👤 Profile Modal */}
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

              {/* Display Quick Message from Offering */}
              {quickMessages[userProfile.uid] && (
                <div className="mt-3">
                  <div className="fw-bold mb-2">Quick Message</div>
                  {/*<p>{quickMessages[userProfile.uid].message}</p>{" "}*/}
                  <p className="mb-0">{quickMessages[userProfile.uid].message}</p>
                  {/* Access and render 'message' */}
                </div>
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

export default WaitlistModal;

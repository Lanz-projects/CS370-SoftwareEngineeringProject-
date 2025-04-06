import React, { useEffect, useState } from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";

const AcceptedUsersModal = ({ offeringId, showModal, handleCloseModal }) => {
  const [acceptedUsers, setAcceptedUsers] = useState([]); // Store accepted users
  const [showProfile, setShowProfile] = useState(false); // To toggle the profile view
  const [userProfile, setUserProfile] = useState(null); // Store user profile data

  useEffect(() => {
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
      } catch (error) {
        console.error("Error fetching accepted users:", error);
      }
    };

    if (showModal) {
      fetchAcceptedUsers();
    }
  }, [offeringId, showModal]);

  const handleProfileClick = (user) => {
    setUserProfile(user); // Directly set the user profile data
    setShowProfile(true); // Show the profile modal
  };

  const handleDeleteUser = async (user) => {
    try {
      const token = localStorage.getItem("token");
      //console.log(user);
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
          body: JSON.stringify({ user }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(data.message); // Successfully removed user from accepted
        // Update the state to reflect changes
        setAcceptedUsers((prevUsers) =>
          prevUsers.filter((users) => users._id !== user)
        );
        alert("User has been deleted");
      } else {
        console.error("Error removing user from accepted:", data.error);
      }
    } catch (error) {
      console.error("Error removing user from accepted:", error);
    }
  };

  return (
    <>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Accepted Users</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {acceptedUsers.map((user) => (
              <ListGroup.Item
                key={user._id}
                className="d-flex justify-content-between"
              >
                <span>{user.name}</span>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleProfileClick(user)} // Pass the entire user object
                  >
                    Profile
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleDeleteUser(user.uid)}
                  >
                    Remove
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      {/* Profile Modal */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{userProfile ? userProfile.name : "Loading..."}</Modal.Title>
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

export default AcceptedUsersModal;

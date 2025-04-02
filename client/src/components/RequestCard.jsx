import React, { useState } from "react";
import { Card, Button, Modal } from "react-bootstrap";
import { Star, Person } from "react-bootstrap-icons";

const RequestCard = ({ request }) => {
  const { name, location, arrivaldate, notes, wants, userid } = request;
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const locationString = `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/request/${request._id}`);
      const data = await response.json();
      if (data.request) {
        //console.log(data.request.user);
        setUserProfile(data.request.user);
        setShowProfile(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  return (
    <>
      <Card className="mb-3 position-relative p-3 shadow-sm rounded">
        {/* Star Button - Top Right */}
        <Button
          variant="outline-warning"
          className="position-absolute top-0 end-0 m-2 p-1 border-0"
        >
          <Star size={20} />
        </Button>

        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <Card.Title>{name}</Card.Title>
            {/* User Profile Button */}
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
            {locationString}
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

        {/* Accept Button - Bottom */}
        <Card.Footer className="bg-white border-0 text-center">
          <Button variant="success" className="w-100">
            Accept
          </Button>
        </Card.Footer>
      </Card>

      {/* Modal for User Profile */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {userProfile ? userProfile.name : "Loading..."}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userProfile ? (
            <>
              {/* Name */}
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                  Name
                </div>
                <div>{userProfile.name}</div>
              </div>

              {/* Email */}
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                  Email
                </div>
                <div>{userProfile.email}</div>
              </div>

              {/* Contact Info */}
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                  Contact
                </div>
                {userProfile.contactInfo &&
                userProfile.contactInfo.length > 0 ? (
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

              {/* Vehicle Info */}
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                  Vehicle Info
                </div>
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
    </>
  );
};

export default RequestCard;

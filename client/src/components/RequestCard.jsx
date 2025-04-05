import React, { useState } from "react";
import { Card, Button, Modal } from "react-bootstrap";
import { Star, Person, StarFill } from "react-bootstrap-icons";

const RequestCard = ({ request, userFavorites }) => {
  const { name, location, arrivaldate, notes, wants, userid, _id } = request;
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const locationString = `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;

  // Check if this offering is favorited
  const isFavoritedStatus = userFavorites.includes(_id); 

  // Function to fetch user profile
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

  // Handle the "star" button click to favorite a request
  const handleFavorite = async () => {
    try {
      const token = localStorage.getItem("token");

      // URL for the API based on whether the offering is favorited or not
      const url = isFavoritedStatus
        ? "http://localhost:5000/api/user/remove-favorite" // Use the remove endpoint if it's already favorited
        : "http://localhost:5000/api/user/favorite-request"; // Use the add endpoint if it's not favorited

      const response = await fetch(
        url,
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

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        console.log("Request added to favorites:", data.message);
      } else {
        console.error("Error adding request to favorites:", data.error);
      }
    } catch (error) {
      console.error("Error adding request to favorites", error);
    }
  };

  return (
    <>
      <Card className="mb-3 position-relative p-3 shadow-sm rounded">
        {/* Star Button - Top Right */}
        <Button
          variant="outline-warning"
          className="position-absolute top-0 end-0 m-2 p-1 border-0"
          onClick={handleFavorite} // Add click handler
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

        <Card.Footer className="bg-white border-0 text-center">
          <Button variant="success" className="w-100">
            Accept
          </Button>
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
              {/* Name */}
              <div className="mb-3 p-2 border rounded">
                <strong>Name:</strong> {userProfile.name}
              </div>

              {/* Email */}
              <div className="mb-3 p-2 border rounded">
                <strong>Email:</strong> {userProfile.email}
              </div>

              {/* Contact Info */}
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

              {/* Vehicle Info */}
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
    </>
  );
};

export default RequestCard;

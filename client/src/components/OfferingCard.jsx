import React, { useState } from "react";
import { Card, Button, Modal } from "react-bootstrap";
import { Star, Person, StarFill } from "react-bootstrap-icons";

const OfferingCard = ({ offering, userFavorites }) => {
  const { name, location, arrivaldate, vehicleid, notes, userid, _id } =
    offering;
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const locationString = `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;

  // Check if this offering is favorited
  const isFavoritedStatus = userFavorites.includes(_id); 

  // URL for the API based on whether the offering is favorited or not
  const url = isFavoritedStatus
  ? "http://localhost:5000/api/user/remove-favorite" // Use the remove endpoint if it's already favorited
  : "http://localhost:5000/api/user/favorite-offering"; // Use the add endpoint if it's not favorited

  //  Favorite handler
  const handleFavorite = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/user/favorite-offering",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            offeringId: _id,
            type: "offering",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Offering added to favorites:", data.message);
      } else {
        console.error("Error adding offering to favorites:", data.error);
      }
    } catch (error) {
      console.error("Error adding offering to favorites", error);
    }
  };

  // 👤 Fetch profile modal
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/offering/${offering._id}`);
      const data = await response.json();
      if (data.offering) {
        setUserProfile(data.offering.user);
        setShowProfile(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  return (
    <>
      <Card className="mb-3 position-relative p-3 shadow-sm rounded">
        {/* ⭐ Star Button */}
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
            Offering a Ride
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
        </Card.Body>

        <Card.Footer className="bg-white border-0 text-center">
          <Button variant="primary" className="w-100">
            Request to Ride
          </Button>
        </Card.Footer>
      </Card>

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
              {/* Name */}
              <div className="mb-2 p-2 border rounded">
                <div className="fw-bold mb-1">Name</div>
                <div>{userProfile.name}</div>
              </div>

              {/* Email */}
              <div className="mb-2 p-2 border rounded">
                <div className="fw-bold mb-1">Email</div>
                <div>{userProfile.email}</div>
              </div>

              {/* Contact Info */}
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

              {/* Vehicle Info */}
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
    </>
  );
};

export default OfferingCard;

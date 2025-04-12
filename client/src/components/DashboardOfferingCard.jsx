import React, { useState } from "react";
import { Card, Button, Modal } from "react-bootstrap";
import { Star, Person, StarFill, People } from "react-bootstrap-icons";
import CombinedWaitlistModal from "./CombinedWaitlistModal";

const DashboardOfferingCard = ({ offering, userFavorites }) => {
  const {
    name,
    location,
    arrivaldate,
    arrivaltime,
    vehicleid,
    notes,
    _id,
    maxSeats,
    originalMaxSeats,
    waitingList,
    acceptedUsers,
    userid,
  } = offering;

  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const locationString = `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;
  const isFavorited = userFavorites.includes(_id);

  // Calculate total capacity (if originalMaxSeats exists, use it, otherwise use maxSeats + acceptedUsers.length)
  const totalCapacity =
    originalMaxSeats || maxSeats + acceptedUsers?.length || 0;

  const handleFavorite = async () => {
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
        console.log(
          `${
            isFavorited ? "Offering removed from" : "Offering added to"
          } favorites:`,
          data.message
        );
        window.location.reload();
      } else {
        console.error(
          `${
            isFavorited ? "Error removing" : "Error adding"
          } offering from favorites:`,
          data.error
        );
      }
    } catch (error) {
      console.error("Error handling favorite:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/delete-offering/${_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Offering deleted successfully:", data.message);
        window.location.reload();
      } else {
        console.error("Error deleting offering:", data.error);
      }
    } catch (error) {
      console.error("Error deleting offering:", error);
    }
  };

  // Added user profile fetch functionality
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/offering/${_id}`);
      const data = await response.json();
      if (data.offering) {
        setUserProfile(data.offering.user);
        setShowProfile(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
            Offer a ride
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

          <Card.Text className="d-flex align-items-center mb-1">
            <Person className="me-2" />
            <strong>
              Available Seats: {maxSeats} / {totalCapacity}
            </strong>
          </Card.Text>
          <Card.Text className="d-flex align-items-center">
            <People className="me-2" />
            <strong>Wait List: {waitingList.length}</strong>
          </Card.Text>
        </Card.Body>

        <Card.Footer className="bg-white border-0 text-center">
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="success"
              size="md"
              className="w-50"
              onClick={() => setShowModal(true)}
            >
              Manage Users
            </Button>
            <Button
              variant="danger"
              size="md"
              className="w-50"
              onClick={handleDelete}
            >
              Cancel
            </Button>
          </div>
        </Card.Footer>
      </Card>

      {/* Combined modal for managing waitlisted and accepted users */}
      <CombinedWaitlistModal
        offeringId={_id}
        showModal={showModal}
        handleCloseModal={() => setShowModal(false)}
      />

      {/* Added Profile Modal */}
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
    </>
  );
};

export default DashboardOfferingCard;

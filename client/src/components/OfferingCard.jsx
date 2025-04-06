import React, { useState } from "react";
import { Card, Button, Modal } from "react-bootstrap";
import { Star, Person, People } from "react-bootstrap-icons";
import RequestToRideModal from "./RequestToRideModal"; // import the modal component

const OfferingCard = ({ offering }) => {
  const {
    _id,
    name,
    location,
    arrivaldate,
    vehicleid,
    notes,
    userid,
    maxSeats,
    waitingList,
  } = offering;

  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");

  const locationString = `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;

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

  const handleConfirm = () => {
    console.log("Confirmed with message:", quickMessage);
    // Add logic here to send message to backend if needed
    setShowRequestModal(false);
    setQuickMessage("");
  };

  return (
    <>
      <Card className="mb-3 position-relative p-3 shadow-sm rounded">
        <Button
          variant="outline-warning"
          className="position-absolute top-0 end-0 m-2 p-1 border-0"
        >
          <Star size={20} />
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

          <Card.Text className="d-flex align-items-center mb-1">
            <Person className="me-2" />
            <strong>Available Seats: {maxSeats}</strong>
          </Card.Text>
          <Card.Text className="d-flex align-items-center">
            <People className="me-2" />
            <strong>Wait List: {waitingList.length}</strong>
          </Card.Text>
        </Card.Body>

        <Card.Footer className="bg-white border-0 text-center">
          <Button
            variant="primary"
            className="w-100"
            onClick={() => setShowRequestModal(true)}
          >
            Request to Ride
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
              <div className="mb-3 p-3 border rounded">
                <div className="fw-bold mb-1">Name</div>
                <div>{userProfile.name}</div>
              </div>

              <div className="mb-3 p-3 border rounded">
                <div className="fw-bold mb-1">Email</div>
                <div>{userProfile.email}</div>
              </div>

              <div className="mb-3 p-3 border rounded">
                <div className="fw-bold mb-1">Contact</div>
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

              <div className="mb-3 p-3 border rounded">
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

      {/* Request to Ride Modal */}
      <RequestToRideModal
        show={showRequestModal}
        handleClose={() => setShowRequestModal(false)}
        quickMessage={quickMessage}
        setQuickMessage={setQuickMessage}
        offeringId={_id}
      />
    </>
  );
};

export default OfferingCard;

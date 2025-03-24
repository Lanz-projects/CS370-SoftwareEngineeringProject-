import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const PostRideListing = ({ show, handleClose }) => {
  const [userId, setUserId] = useState("");
  const [location, setLocation] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Posting a ride listing with User ID: ${userId}, Location: ${location}, Arrival Date: ${arrivalDate}, Vehicle ID: ${vehicleId}, Notes: ${notes}`);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Post a Ride Listing</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>User ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Destination</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter destination"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Arrival Date</Form.Label>
            <Form.Control
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Vehicle ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter vehicle ID"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Enter notes (this may include number of passengers, luggage space, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PostRideListing;
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const RequestRide = ({ show, handleClose }) => {
  const [destination, setDestination] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Requesting a ride to ${destination}`);
    handleClose();
  };

  return (
    <Modal show = {show} onHide = {handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Request a Ride</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit = {handleSubmit}>
          <Form.Group className = "mb-3">
            <Form.Label>Destination</Form.Label>
            <Form.Control
              type = "text"
              placeholder = "Enter destination"
              value = {destination}
              onChange = {(e) => setDestination(e.target.value)}
            />
          </Form.Group>
          <Button type = "submit" variant = "primary">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RequestRide;
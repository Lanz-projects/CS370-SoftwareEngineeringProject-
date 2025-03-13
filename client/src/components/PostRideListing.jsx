import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const PostRideListing = ({ show, handleClose }) => {
  const [destination, setDestination] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Posting a ride listing to ${destination} with details: ${details}`);
    handleClose();
  };

  return (
    <Modal show = {show} onHide = {handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Post a Ride Listing</Modal.Title>
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
          <Form.Group className = "mb-3">
            <Form.Label>Details</Form.Label>
            <Form.Control
              as = "textarea"
              placeholder = "Enter ride details"
              value = {details}
              onChange = {(e) => setDetails(e.target.value)}
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

export default PostRideListing;
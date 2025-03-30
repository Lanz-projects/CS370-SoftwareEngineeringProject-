import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const RequestRide = ({ show, handleClose }) => {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [notes, setNotes] = useState("");
  const [wants, setWants] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  // Get today's date and one month ahead date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 1);

  // Format dates in YYYY-MM-DD format
  const todayString = today.toISOString().split("T")[0];
  const maxDateString = maxDate.toISOString().split("T")[0];

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!destination.trim()) newErrors.destination = "Destination is required";
    if (!latitude || !longitude) newErrors.location = "Latitude and Longitude are required";
    if (!arrivalDate) newErrors.arrivalDate = "Arrival date is required";
    else if (arrivalDate < todayString) newErrors.arrivalDate = "Arrival date cannot be in the past";
    if (arrivalDate > maxDateString) newErrors.arrivalDate = "Arrival date cannot be more than 1 month ahead";
    if (notes.length > 200) newErrors.notes = "Notes must be under 200 characters";
    if (wants.length > 200) newErrors.wants = "Wants must be under 200 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:5000/api/create-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for verification
        },
        body: JSON.stringify({
          name,
          latitude,
          longitude,
          arrivaldate: arrivalDate,
          notes,
          wants,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Request submitted successfully!" });
        handleClose(); // Close modal
      } else {
        setMessage({ type: "danger", text: data.error || "Failed to submit request." });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Error connecting to server." });
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Request a Ride</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant={message.type}>{message.text}</Alert>}
        <Form onSubmit={handleSubmit}>
          {/* Name */}
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>

          {/* Destination */}
          <Form.Group className="mb-3">
            <Form.Label>Destination</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              isInvalid={!!errors.destination}
            />
            <Form.Control.Feedback type="invalid">{errors.destination}</Form.Control.Feedback>
          </Form.Group>

          {/* Latitude */}
          <Form.Group className="mb-3">
            <Form.Label>Latitude</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              isInvalid={!!errors.location}
            />
          </Form.Group>

          {/* Longitude */}
          <Form.Group className="mb-3">
            <Form.Label>Longitude</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              isInvalid={!!errors.location}
            />
            <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
          </Form.Group>

          {/* Arrival Date */}
          <Form.Group className="mb-3">
            <Form.Label>Arrival Date</Form.Label>
            <Form.Control
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              min={todayString}
              max={maxDateString}
              isInvalid={!!errors.arrivalDate}
            />
            <Form.Control.Feedback type="invalid">{errors.arrivalDate}</Form.Control.Feedback>
          </Form.Group>

          {/* Notes */}
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Enter notes (max 200 characters)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              isInvalid={!!errors.notes}
              maxLength={200}
            />
            <Form.Control.Feedback type="invalid">{errors.notes}</Form.Control.Feedback>
          </Form.Group>

          {/* Wants */}
          <Form.Group className="mb-3">
            <Form.Label>Wants</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Enter additional requests (max 200 characters)"
              value={wants}
              onChange={(e) => setWants(e.target.value)}
              isInvalid={!!errors.wants}
              maxLength={200}
            />
            <Form.Control.Feedback type="invalid">{errors.wants}</Form.Control.Feedback>
          </Form.Group>

          {/* Submit Button */}
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RequestRide;

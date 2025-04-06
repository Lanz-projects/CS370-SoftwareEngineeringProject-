import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const PostRideListing = ({ show, handleClose }) => {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [notes, setNotes] = useState("");
  const [availableSeats, setAvailableSeats] = useState(""); // 🆕 new state
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 1);

  const todayString = today.toISOString().split("T")[0];
  const maxDateString = maxDate.toISOString().split("T")[0];

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!latitude || !longitude) newErrors.location = "Latitude and longitude are required";
    if (!arrivalDate) newErrors.arrivalDate = "Arrival date is required";
    else if (arrivalDate < todayString) newErrors.arrivalDate = "Arrival date cannot be in the past";
    else if (arrivalDate > maxDateString) newErrors.arrivalDate = "Arrival date cannot be more than one month ahead";
    if (notes.length > 200) newErrors.notes = "Notes must be under 200 characters";
    if (!availableSeats || availableSeats <= 0) newErrors.availableSeats = "Available seats must be at least 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:5000/api/create-offering", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          latitude,
          longitude,
          arrivaldate: arrivalDate,
          vehicleid: vehicleId,
          notes,
          maxSeats: parseInt(availableSeats, 10), // 🆕 include it
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Ride offering posted successfully!" });
        handleClose();
      } else {
        setMessage({ type: "danger", text: data.error || "Failed to post offering." });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Error connecting to server." });
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Post a Ride Listing</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant={message.type}>{message.text}</Alert>}
        <Form onSubmit={handleSubmit}>
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

          <Form.Group className="mb-3">
            <Form.Label>Latitude</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              isInvalid={!!errors.location}
            />
            <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
          </Form.Group>

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

          <Form.Group className="mb-3">
            <Form.Label>Arrival Date</Form.Label>
            <Form.Control
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              isInvalid={!!errors.arrivalDate}
              min={todayString}
              max={maxDateString}
            />
            <Form.Control.Feedback type="invalid">{errors.arrivalDate}</Form.Control.Feedback>
          </Form.Group>

          {/* 🆕 Available Seats */}
          <Form.Group className="mb-3">
            <Form.Label>Available Seats</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter number of available seats"
              value={availableSeats}
              onChange={(e) => setAvailableSeats(e.target.value)}
              isInvalid={!!errors.availableSeats}
              min={1}
            />
            <Form.Control.Feedback type="invalid">{errors.availableSeats}</Form.Control.Feedback>
          </Form.Group>

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

          <Button type="submit" variant="primary">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PostRideListing;

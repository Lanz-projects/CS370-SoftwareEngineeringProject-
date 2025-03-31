import React, { useState, useRef } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";

const RequestRide = ({ show, handleClose, onRequestCreated }) => {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [arrivalDate, setArrivalDate] = useState("");
  const [notes, setNotes] = useState("");
  const [wants, setWants] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const destinationInputRef = useRef(null);

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${import.meta.env.VITE_GEOLOCATION_API}`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== "OK") {
        throw new Error(data.error_message || "Location not found");
      }

      const location = data.results[0]?.geometry?.location;
      if (!location) {
        throw new Error("No location data returned from geocoding service");
      }
      
      const lng = parseFloat(location.lng);
      const lat = parseFloat(location.lat);
      
      if (isNaN(lng)) {
        throw new Error(`Invalid longitude received: ${location.lng}`);
      }
      if (isNaN(lat)) {
        throw new Error(`Invalid latitude received: ${location.lat}`);
      }
      
      return {
        lng,
        lat,
        formatted_address: data.results[0].formatted_address
      };
      
    } catch (error) {
      console.error("Geocoding failed:", error);
      setMessage({ 
        type: "danger", 
        text: `Location search failed: ${error.message}` 
      });
      return null;
    }
  };

  const handleDestinationSearch = async () => {
    if (!destination.trim()) {
      setMessage({ type: "warning", text: "Please enter a destination" });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await geocodeAddress(destination);
      if (result) {
        setCoordinates([result.lng, result.lat]);
        setDestination(result.formatted_address);
        setIsLocationVerified(true);
      } else {
        setCoordinates(null);
        setIsLocationVerified(false);
      }
    } catch (error) {
      setCoordinates(null);
      setIsLocationVerified(false);
      setMessage({ 
        type: "danger", 
        text: error.message || "Failed to find location" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = "Name is required";
    if (!destination.trim()) newErrors.destination = "Destination is required";
    
    if (!isLocationVerified || !coordinates || coordinates.length !== 2) {
      newErrors.coordinates = "Please verify your location";
    } else if (coordinates.some(c => c === null || isNaN(c) || typeof c !== 'number')) {
      newErrors.coordinates = "Invalid location coordinates";
      console.error("Invalid coordinates detected:", coordinates);
    }
    
    if (!arrivalDate) newErrors.arrivalDate = "Arrival date is required";
    if (notes.length > 200) newErrors.notes = "Notes must be under 200 characters";
    if (wants.length > 200) newErrors.wants = "Requests must be under 200 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!coordinates || coordinates.some(c => c === null || isNaN(c))) {
      setMessage({ 
        type: "danger", 
        text: "System error: Invalid coordinates. Please try again." 
      });
      setIsLocationVerified(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/create-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          latitude: coordinates[1],
          longitude: coordinates[0],
          arrivaldate: arrivalDate,
          notes,
          wants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setMessage({ 
        type: "success", 
        text: data.message || "Ride request submitted successfully!" 
      });
      
      // Reset form and notify parent component
      setTimeout(() => {
        setName("");
        setDestination("");
        setCoordinates(null);
        setArrivalDate("");
        setNotes("");
        setWants("");
        setIsLocationVerified(false);
        if (onRequestCreated) {
          onRequestCreated(data);
        }
        handleClose();
      }, 1500);
    } catch (error) {
      setMessage({ 
        type: "danger", 
        text: error.message || "Failed to submit ride request" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={!isLoading ? handleClose : null} size="lg">
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title>Request a Ride</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant={message.type}>{message.text}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Your Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              isInvalid={!!errors.name}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Destination</Form.Label>
            <div className="d-flex">
              <Form.Control
                ref={destinationInputRef}
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setIsLocationVerified(false);
                  setCoordinates(null);
                }}
                placeholder="Enter address"
                isInvalid={!!errors.destination || !!errors.coordinates}
                required
              />
              <Button 
                variant="primary" 
                onClick={handleDestinationSearch}
                disabled={!destination.trim() || isLoading}
                className="ms-2"
              >
                {isLoading ? <Spinner size="sm" /> : "Find Location"}
              </Button>
            </div>
            {errors.destination && (
              <Form.Control.Feedback type="invalid">
                {errors.destination}
              </Form.Control.Feedback>
            )}
            {errors.coordinates && (
              <div className="text-danger small mt-1">
                {errors.coordinates}
              </div>
            )}
            {coordinates && (
              <div className="mt-2 text-muted small">
                Verified location: {coordinates.join(", ")}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Arrival Date</Form.Label>
            <Form.Control
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              isInvalid={!!errors.arrivalDate}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.arrivalDate}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes (max 200 characters)"
              isInvalid={!!errors.notes}
            />
            <Form.Control.Feedback type="invalid">
              {errors.notes}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {notes.length}/200 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Wants</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={wants}
              onChange={(e) => setWants(e.target.value)}
              placeholder="Enter additional requests (max 200 characters)"
              isInvalid={!!errors.wants}
            />
            <Form.Control.Feedback type="invalid">
              {errors.wants}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {wants.length}/200 characters
            </Form.Text>
          </Form.Group>

          <Button 
            type="submit" 
            variant="primary" 
            disabled={isLoading || !isLocationVerified}
            className="w-100 mt-3"
          >
            {isLoading ? <Spinner size="sm" /> : "Submit Request"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RequestRide;
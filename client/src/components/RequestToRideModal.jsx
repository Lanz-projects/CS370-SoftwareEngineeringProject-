import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const RequestToRideModal = ({
  show,
  handleClose,
  quickMessage,
  setQuickMessage,
  offeringId,
  onRequestSuccess, // New prop to handle successful request
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
  
    // Use default message if the quickMessage is empty
    const messageToSend = quickMessage.trim() === "" ? "No message sent" : quickMessage;
  
    try {
      const response = await fetch(`/api/request-ride/${offeringId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageToSend }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        //alert("Ride request sent successfully!");
        setQuickMessage(""); // Clear the message after sending
        // Call the callback function to update the parent component
        if (onRequestSuccess) {
          onRequestSuccess();
        }
        handleClose();
        window.location.reload();
      } else {
        alert(data.error || "Failed to send request.");
      }
    } catch (error) {
      console.error("Error requesting ride:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Request to Ride</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label htmlFor="quickMessage" className="form-label">
            Is there anything you want to say?
          </label>
          <textarea
            id="quickMessage"
            className="form-control"
            maxLength={200}
            rows={3}
            placeholder="Say something (max 200 characters)..."
            value={quickMessage}
            onChange={(e) => setQuickMessage(e.target.value)}
          />
          <div className="text-end text-muted small">
            {quickMessage.length}/200
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Confirm"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RequestToRideModal;
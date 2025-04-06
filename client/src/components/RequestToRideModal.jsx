import React from "react";
import { Modal, Button } from "react-bootstrap";

const RequestToRideModal = ({
  show,
  handleClose,
  quickMessage,
  setQuickMessage,
  offeringId,
}) => {
  const handleConfirm = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/request-ride/${offeringId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: quickMessage }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Ride request sent successfully!");
        handleClose();
      } else {
        alert(data.error || "Failed to send request.");
      }
    } catch (error) {
      console.error("Error requesting ride:", error);
      alert("Something went wrong. Please try again.");
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
            Is there any you want to say?
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
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RequestToRideModal;

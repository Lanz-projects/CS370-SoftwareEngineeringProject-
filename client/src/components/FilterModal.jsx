import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const FilterModal = ({ show, handleClose, setFilterOptions }) => {
  const [showOfferings, setShowOfferings] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [sortBy, setSortBy] = useState('default'); // Add sorting state

  const handleApply = () => {
    setFilterOptions({
      showOfferings,
      showRequests,
      sortBy // Include sort option in filter settings
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Filter Listings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Listing Types</Form.Label>
            <Form.Check 
              type="checkbox" 
              label="Show Ride Offerings" 
              checked={showOfferings}
              onChange={(e) => setShowOfferings(e.target.checked)}
            />
            <Form.Check 
              type="checkbox" 
              label="Show Ride Requests" 
              checked={showRequests}
              onChange={(e) => setShowRequests(e.target.checked)}
            />
          </Form.Group>
          
          {/* Add sorting options */}
          <Form.Group className="mb-3">
            <Form.Label>Sort By</Form.Label>
            <Form.Select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="soonest">Soonest Arrival Date</option>
              <option value="latest">Latest Arrival Date</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleApply}
          style={{
            backgroundColor: "#b08fd8",
            borderColor: "#b08fd8"
          }}
        >
          Apply Filters
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;
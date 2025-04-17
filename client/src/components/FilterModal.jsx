import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const FilterModal = ({ 
  show, 
  handleClose, 
  filterOptions = {}, 
  setFilterOptions, 
  favoriteOfferIDList = [], 
  favoriteRequestIDList = [] 
}) => {
  const [showOfferings, setShowOfferings] = useState(filterOptions.showOfferings || true);
  const [showRequests, setShowRequests] = useState(filterOptions.showRequests || true);
  const [sortBy, setSortBy] = useState(filterOptions.sortBy || "default");
  const [showFavorites, setShowFavorites] = useState(filterOptions.showFavorites || false);
  const [hasFavorites, setHasFavorites] = useState(false);

  useEffect(() => {
    const hasFavs = (favoriteOfferIDList?.length || 0) > 0 || 
                   (favoriteRequestIDList?.length || 0) > 0;
    setHasFavorites(hasFavs);
    
    if (!hasFavs && showFavorites) {
      setShowFavorites(false);
    }
  }, [favoriteOfferIDList, favoriteRequestIDList, showFavorites]);

  const handleApply = () => {
    setFilterOptions({
      showOfferings,
      showRequests,
      sortBy,
      showFavorites: hasFavorites ? showFavorites : false
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
            <Form.Label><strong>Listing Types</strong></Form.Label>
            <div className="mb-2">
              <Form.Check 
                type="checkbox" 
                label="Show Ride Offerings" 
                checked={showOfferings}
                onChange={(e) => setShowOfferings(e.target.checked)}
              />
            </div>
            <div className="mb-2">
              <Form.Check 
                type="checkbox" 
                label="Show Ride Requests" 
                checked={showRequests}
                onChange={(e) => setShowRequests(e.target.checked)}
              />
            </div>
            <div>
              <Form.Check 
                type="checkbox" 
                label="Show Favorites Only" 
                checked={hasFavorites && showFavorites}
                onChange={(e) => setShowFavorites(e.target.checked)}
                disabled={!hasFavorites}
              />
              {!hasFavorites && (
                <Form.Text className="text-muted">
                  You don't have any favorites yet.
                </Form.Text>
              )}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label><strong>Sort By</strong></Form.Label>
            <Form.Select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="soonest">Soonest Departure Date</option>
              <option value="latest">Latest Departure Date</option>
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
            backgroundColor: "#510b76",
            borderColor: "#510b76"
          }}
        >
          Apply Filters
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;

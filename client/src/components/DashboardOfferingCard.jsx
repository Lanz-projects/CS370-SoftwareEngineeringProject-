import React from "react";
import { Card, Button } from "react-bootstrap";
import { Star, Person } from "react-bootstrap-icons";

const DashboardOfferingCard = ({ offering }) => {
  const { name, location, arrivaldate, vehicleid, notes } = offering;

  // Format the location to a readable string (longitude, latitude)
  const locationString = `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;

  return (
    <Card className="mb-3 position-relative p-3 shadow-sm rounded">
      {/* Star Button - Top Right */}
      <Button
        variant="outline-warning"
        className="position-absolute top-0 end-0 m-2 p-1 border-0"
      >
        <Star size={20} />
      </Button>
      
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <Card.Title>{name}</Card.Title>
          {/* User Profile Button */}
          <Button variant="outline-primary" className="border-0">
            <Person size={20} /> Profile
          </Button>
        </div>
        
        <Card.Text>
          <strong>Location: </strong>
          {locationString}
        </Card.Text>
        <Card.Text>
          <strong>Arrival Date: </strong>
          {new Date(arrivaldate).toLocaleDateString()}
        </Card.Text>
        <Card.Text>
          <strong>Notes: </strong>
          {notes || "No additional notes."}
        </Card.Text>
      </Card.Body>

      {/* Approve and Cancel Buttons - Bottom */}
      <Card.Footer className="bg-white border-0 text-center">
        <div className="d-flex justify-content-center gap-3">
          <Button variant="success" size="md" className="w-50">
            Approve
          </Button>
          <Button variant="danger" size="md" className="w-50">
            Cancel
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default DashboardOfferingCard;

import React from "react";
import { Card, Button } from "react-bootstrap";
import { Star, Person } from "react-bootstrap-icons";

const DashboardRequestCard = ({ request }) => {
  const { name, location, arrivaldate, notes, wants } = request;
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
        
        <Card.Subtitle className="mb-2 text-muted">Request for a ride</Card.Subtitle>
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
        {wants && (
          <Card.Text>
            <strong>Wants: </strong>
            {wants}
          </Card.Text>
        )}
      </Card.Body>
      
      {/* Accept Button - Bottom */}
      <Card.Footer className="bg-white border-0 text-center">
        <Button variant="danger" className="w-100">
          Cancel
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default DashboardRequestCard;

import React from "react";
import { Card } from "react-bootstrap";

const RequestCard = ({ request }) => {
  const { name, location, arrivaldate, notes, wants } = request;

  // Format the location to a readable string (longitude, latitude)
  const locationString = `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Request for a ride
        </Card.Subtitle>
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
    </Card>
  );
};

export default RequestCard;

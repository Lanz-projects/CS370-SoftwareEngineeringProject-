import React from "react";
import { Card } from "react-bootstrap";

const OfferingCard = ({ offering }) => {
  const { name, location, arrivaldate, vehicleid, notes } = offering;

  // Format the location to a readable string (longitude, latitude)
  const locationString = `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{name}</Card.Title>
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
          {notes}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default OfferingCard;

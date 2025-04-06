import React from "react";
import { Card, Button } from "react-bootstrap";
import { Star, Person, StarFill } from "react-bootstrap-icons";

const DashboardOfferingCard = ({ offering, userFavorites }) => {
  const { name, location, arrivaldate, vehicleid, notes, _id } = offering;

  // Format the location to a readable string (longitude, latitude)
  const locationString = `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;

  // Check if this offering is favorited
  const isFavorited = userFavorites.includes(_id);

  // Handle the "star" button click (Add or Remove from Favorites)
  const handleFavorite = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the auth token from local storage

      // URL for the API based on whether the offering is favorited or not
      const url = isFavorited
        ? "http://localhost:5000/api/user/remove-favorite" // Use the remove endpoint if it's already favorited
        : "http://localhost:5000/api/user/favorite-offering"; // Use the add endpoint if it's not favorited

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`, // Attach the token in the Authorization header
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offeringId: _id, // Sending the offeringId for either adding or removing
          type: "offering", // Indicating that it's an offering
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`${isFavorited ? "Offering removed from" : "Offering added to"} favorites:`, data.message);
      } else {
        console.error(`${isFavorited ? "Error removing" : "Error adding"} offering from favorites:`, data.error);
      }
    } catch (error) {
      console.error(`${isFavorited ? "Error removing" : "Error adding"} offering from favorites`, error);
    }
  };

  // Handle the delete (cancel) action
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the auth token from local storage
      const response = await fetch(`http://localhost:5000/api/delete-offering/${_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Attach the token in the Authorization header
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Offering deleted successfully:", data.message);
      } else {
        console.error("Error deleting offering:", data.error);
      }
    } catch (error) {
      console.error("Error deleting offering", error);
    }
  };

  return (
    <Card className="mb-3 position-relative p-3 shadow-sm rounded">
      {/* Star Button - Top Right */}
      <Button
        variant="outline-warning"
        className="position-absolute top-0 end-0 m-2 p-1 border-0"
        onClick={handleFavorite} // Trigger the handleFavorite function
      >
        {isFavorited ? (
          <StarFill size={20} color="gold" />
        ) : (
          <Star size={20} color="gray" />
        )}
      </Button>

      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <Card.Title>{name}</Card.Title>
          {/* User Profile Button */}
          <Button variant="outline-primary" className="border-0">
            <Person size={20} /> Profile
          </Button>
        </div>

        <Card.Subtitle className="mb-2 text-muted">Offer a ride</Card.Subtitle>
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
          <Button variant="danger" size="md" className="w-50" onClick={handleDelete}>
            Cancel
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default DashboardOfferingCard;

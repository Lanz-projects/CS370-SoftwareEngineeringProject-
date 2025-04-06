import React from "react";
import { Card, Button } from "react-bootstrap";
import { Star, Person, StarFill } from "react-bootstrap-icons";

const DashboardRequestCard = ({ request, userFavorites }) => {
  const { name, location, arrivaldate, notes, wants, _id } = request;

  const locationString = `Longitude: ${location.coordinates[0]}, Latitude: ${location.coordinates[1]}`;

  const isFavorited = userFavorites.includes(_id);

  // Handle the "star" button click
  const handleFavorite = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the auth token from local storage

      // URL for the API based on whether the offering is favorited or not
      const url = isFavorited
        ? "http://localhost:5000/api/user/remove-favorite" // Use the remove endpoint if it's already favorited
        : "http://localhost:5000/api/user/favorite-request"; // Use the add endpoint if it's not favorited

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: _id,
          type: "request", 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Request added to favorites:", data.message);
      } else {
        console.error("Error adding request to favorites:", data.error);
      }
    } catch (error) {
      console.error("Error adding request to favorites", error);
    }
  };

  // Handle the "Cancel" button click (delete request)
  const handleCancel = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the auth token from local storage

      // Call the DELETE API to delete the request
      const response = await fetch(`http://localhost:5000/api/delete-request/${_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Request deleted successfully:", data.message);
        // Call the callback function to remove the request from the UI
      } else {
        console.error("Error deleting request:", data.error);
      }
    } catch (error) {
      console.error("Error deleting request", error);
    }
  };

  return (
    <Card className="mb-3 position-relative p-3 shadow-sm rounded">
      {/* Star Button - Top Right */}
      <Button
        variant="outline-warning"
        className="position-absolute top-0 end-0 m-2 p-1 border-0"
        onClick={handleFavorite}
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

      {/* Cancel Button - Bottom */}
      <Card.Footer className="bg-white border-0 text-center">
        <Button variant="danger" className="w-100" onClick={handleCancel}>
          Cancel
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default DashboardRequestCard;

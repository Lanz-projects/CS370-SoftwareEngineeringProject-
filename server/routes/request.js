const express = require("express");
const Request = require("../models/Request-schema");
const User = require("../models/User-schema.js");
const verifyToken = require("../middleware/verifyToken");
const mongoose = require("mongoose");


const router = express.Router();

// Create a new request
router.post("/api/create-request", verifyToken, async (req, res) => {
  const { name, latitude, longitude, arrivaldate, notes, wants } = req.body;
  const userId = req.user.uid;

  // Validate required fields
  if (!name || !arrivaldate) {
    return res.status(400).json({ 
      error: "Missing required fields",
      details: "Name and arrival date are required"
    });
  }

  // Validate coordinates
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ 
      error: "Coordinates are required",
      details: "Please provide both latitude and longitude"
    });
  }

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ 
      error: "Invalid coordinates",
      details: "Coordinates must be numeric values"
    });
  }

  // Convert to numbers in case they came as strings
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  try {
    // Ensure the user exists
    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new request document
    const newRequest = new Request({
      userid: userId,
      name,
      location: {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
      },
      arrivaldate: new Date(arrivaldate),
      notes: notes || "",
      wants: wants || "",
    });

    // Validate the request document before saving
    const validationError = newRequest.validateSync();
    if (validationError) {
      return res.status(400).json({ 
        error: "Validation failed",
        details: validationError.errors 
      });
    }

    // Save the new request
    await newRequest.save();

    res.status(201).json({ 
      message: "Request added successfully!",
      request: newRequest 
    });

  } catch (error) {
    console.error("Error processing request:", error);
    
    // Handle MongoDB geo key errors specifically
    if (error.name === 'MongoServerError' && error.code === 16755) {
      return res.status(400).json({ 
        error: "Invalid location data",
        details: "Coordinates must be valid numbers between -180 and 180 for longitude, -90 and 90 for latitude"
      });
    }

    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

// Get all requests for the authenticated user
router.get("/api/requests", verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    const requests = await Request.find({ userid: userId })
      .sort({ createdAt: -1 }); // Newest first

    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

// Delete a request
router.delete("/api/delete-request/:id", verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { id } = req.params;

  try {
    const requestId = new mongoose.Types.ObjectId(id); // Convert to ObjectId

    // Confirm the request exists and belongs to the current user
    const request = await Request.findOne({ _id: requestId, userid: userId });

    if (!request) {
      return res.status(404).json({
        error: "Request not found or does not belong to the authenticated user",
      });
    }

    // Remove the request ID from all users' favoriteRequest arrays
    const result = await User.updateMany(
      { favoriteRequests: requestId },
      { $pull: { favoriteRequests: requestId } }
    );

    console.log(`Removed from ${result.modifiedCount} user(s).`);

    // Now delete the request itself
    await Request.deleteOne({ _id: requestId });

    res.status(200).json({
      message: "Request deleted and removed from users' favorites successfully!",
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});


// Accept request endpoint
router.put("/api/accept-request/:id", verifyToken, async (req, res) => {
  const requestId = req.params.id;
  const userId = req.user.uid; // This comes from the token via verifyToken middleware
  
  try {
    // Find the request first to check if it's already accepted
    const request = await Request.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ 
        error: "Request not found" 
      });
    }
    
    // Check if request is already accepted
    if (request.userAccepted) {
      return res.status(400).json({ 
        error: "This request has already been accepted" 
      });
    }
    
    // Update the request with the accepting user's ID
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { userAccepted: userId },
      { new: true } // Return the updated document
    );

    // Notify the original requester (would implement actual notification here)
    //console.log(`User ${userId} accepted request from user ${request.userid}`);
    
    return res.status(200).json({ 
      message: "Request accepted successfully",
      request: updatedRequest
    });
  } catch (error) {
    console.error("Error accepting request:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

// Unaccept request endpoint
router.put("/api/unaccept-request/:id", verifyToken, async (req, res) => {
  const requestId = req.params.id;
  const userId = req.user.uid; // This comes from the token via verifyToken middleware
  
  try {
    // Find the request first
    const request = await Request.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ 
        error: "Request not found" 
      });
    }
    
    // Check if request is accepted by this user
    if (request.userAccepted !== userId) {
      return res.status(403).json({ 
        error: "You can only unaccept requests that you have accepted" 
      });
    }
    
    // Update the request to remove the accepting user's ID
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { $unset: { userAccepted: "" } }, // Remove the userAccepted field
      { new: true } // Return the updated document
    );

    // Notify the original requester (would implement actual notification here)
    //console.log(`User ${userId} unaccepted request from user ${request.userid}`);
    
    return res.status(200).json({ 
      message: "Request unaccepted successfully",
      request: updatedRequest
    });
  } catch (error) {
    console.error("Error unaccepting request:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});


module.exports = router;
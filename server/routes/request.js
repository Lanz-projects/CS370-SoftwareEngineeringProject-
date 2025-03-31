const express = require("express");
const Request = require("../models/Request-schema");
const User = require("../models/User-schema.js");
const verifyToken = require("../middleware/verifyToken");

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

module.exports = router;
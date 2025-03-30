const express = require("express");
const Request = require("../models/Request-schema");
const User = require("../models/User-schema.js");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Create a new request (no need to check for existing request anymore)
router.post("/api/create-request", verifyToken, async (req, res) => {
  const { name, latitude, longitude, arrivaldate, notes, wants } = req.body;
  const userId = req.user.uid; // Extract user ID from verified token

  try {
    // Ensure the user exists
    let user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new request document
    const newRequest = new Request({
      userid: userId,
      name,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      arrivaldate,
      notes,
      wants,
    });

    // Save the new request
    await newRequest.save();

    res.json({ message: "Request added successfully!" });

  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all requests for the authenticated user
router.get("/api/requests", verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    // Fetch all requests for the authenticated user
    const requests = await Request.find({ userid: userId });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

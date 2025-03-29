const express = require('express');
const Vehicle = require('../models/Vehicle-schema');
const User = require('../models/User-schema.js');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Route to add or update a vehicle
router.post("/api/add-vehicle", verifyToken, async (req, res) => {
  const { color, make, model } = req.body;
  const userId = req.user.uid;

  try {
    // Check if user exists
    let user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if a vehicle already exists for the user
    let vehicle = await Vehicle.findOne({ userid: userId });

    if (vehicle) {
      // Update existing vehicle
      vehicle.color = color;
      vehicle.make = make;
      vehicle.model = model;
      await vehicle.save();
    } else {
      // Create a new vehicle document
      vehicle = new Vehicle({ userid: userId, color, make, model });
      await vehicle.save();
    }

    // Update user's vehicleid
    user.vehicleid = vehicle._id; 
    await user.save();

    res.json({ message: "Vehicle added/updated successfully!", vehicle });

  } catch (error) {
    console.error("Error adding/updating vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get all vehicles for a user
router.get("/api/vehicles", verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    const vehicles = await Vehicle.find({ userid: userId });
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

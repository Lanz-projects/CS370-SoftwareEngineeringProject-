const express = require('express');
const Vehicle = require('../models/Vehicle-schema');
const User = require('../models/User-schema.js');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Existing route to add or update a vehicle
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

// New route specifically for updating vehicles
router.post("/api/update-vehicle", verifyToken, async (req, res) => {
  const { color, make, model } = req.body;
  const userId = req.user.uid;
  
  try {
    // Check if user exists
    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if a vehicle exists for the user
    const vehicle = await Vehicle.findOne({ userid: userId });
    
    if (!vehicle) {
      return res.status(404).json({ error: "No vehicle found for this user" });
    }
    
    // Update vehicle fields
    vehicle.color = color || vehicle.color;
    vehicle.make = make || vehicle.make;
    vehicle.model = model || vehicle.model;
    
    await vehicle.save();
    
    res.json({ 
      message: "Vehicle updated successfully!", 
      vehicle 
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
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

// New route to delete a vehicle
router.delete("/api/delete-vehicle", verifyToken, async (req, res) => {
  const userId = req.user.uid;
  
  try {
    // Check if user exists
    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Find and delete the vehicle
    const result = await Vehicle.findOneAndDelete({ userid: userId });
    
    if (!result) {
      return res.status(404).json({ error: "No vehicle found for this user" });
    }
    
    // Remove vehicle reference from user
    user.vehicleid = null;
    await user.save();
    
    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
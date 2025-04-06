const express = require("express");
const Offering = require("../models/Offering-schema"); // Use the Offering schema here
const User = require("../models/User-schema");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Create a new offering (no need to check for existing offering anymore)
router.post("/api/create-offering", verifyToken, async (req, res) => {
  const { name, longitude, latitude, arrivaldate, notes } = req.body;
  const userId = req.user.uid; // Extract user ID from verified token

  try {
    // Ensure the user exists
    let user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has a vehicle registered
    if (!user.vehicleid) {
      return res.status(400).json({ error: "You have no vehicle recorded" });
    }

    // Create a new offering
    const newOffering = new Offering({
      userid: userId,
      name,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      arrivaldate,
      notes,
      vehicleid: user.vehicleid, // Using the user's vehicleid
    });

    // Save the new offering
    await newOffering.save();

    res.json({ message: "Offering added successfully!" });

  } catch (error) {
    console.error("Error processing offering:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all offerings for the authenticated user
router.get("/api/offerings", verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    // Fetch all offerings for the authenticated user
    const offerings = await Offering.find({ userid: userId });
    res.json(offerings);
  } catch (error) {
    console.error("Error fetching offerings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete an offering by ID
router.delete("/api/delete-offering/:id", verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const offeringId = req.params.id;

  try {
    // Ensure the offering exists and belongs to the authenticated user
    const offering = await Offering.findOne({ _id: offeringId, userid: userId });
    if (!offering) {
      return res.status(404).json({ error: "Offering not found or not owned by the user" });
    }

    // Delete the offering
    await Offering.deleteOne({ _id: offeringId });

    res.json({ message: "Offering deleted successfully" });

  } catch (error) {
    console.error("Error deleting offering:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

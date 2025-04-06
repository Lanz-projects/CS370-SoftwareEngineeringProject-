const express = require("express"); 
const Offering = require("../models/Offering-schema"); // Use the Offering schema here
const User = require("../models/User-schema");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Create a new offering (with maxSeats)
router.post("/api/create-offering", verifyToken, async (req, res) => {
  const { name, longitude, latitude, arrivaldate, notes, maxSeats } = req.body;
  const userId = req.user.uid; // Extract user ID from verified token

  // Validate maxSeats
  if (!maxSeats || maxSeats <= 0) {
    return res.status(400).json({ error: "Invalid maxSeats value", details: "maxSeats must be a positive number" });
  } 

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
      maxSeats, // Add maxSeats to the offering
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

// Request to join an offering's waiting list
router.post("/api/request-ride/:offeringId", verifyToken, async (req, res) => {
  const { offeringId } = req.params;
  const userId = req.user.uid;
  const { message } = req.body;
  try {
    // Ensure user exists
    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the offering
    const offering = await Offering.findById(offeringId); 
    if (!offering) {
      return res.status(404).json({ error: "Offering not found" });
    }

    // Check if already on the waiting list
    if (offering.waitingList.includes(userId)) {
      return res.status(400).json({ error: "You have already requested this ride." });
    }

    
    // Add user ID to the waiting list
    offering.waitingList.push(userId);
    offering.quickMessage.push(message);
    await offering.save();

    res.json({ message: "Successfully added to waiting list." });

  } catch (error) {
    console.error("Error adding to waiting list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;

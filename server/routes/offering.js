const express = require("express");
const Offering = require("../models/Offering-schema"); // Use the Offering schema here
const User = require("../models/User-schema");
const verifyToken = require("../middleware/verifyToken");
const mongoose = require("mongoose");

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
      originalMaxSeats: maxSeats, // Store the original maxSeats value
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
    
    // Add the user ID and message to the quickMessage array
    offering.quickMessage.push({
      message: message,
      userid: userId
    });
    
    await offering.save();

    res.json({ message: "Successfully added to waiting list." });

  } catch (error) {
    console.error("Error adding to waiting list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get waitlisted users for a specific offering, including their quick messages
router.get("/api/offering/:offeringId/waitlist", verifyToken, async (req, res) => {
  const { offeringId } = req.params;

  try {
    // Find the offering
    const offering = await Offering.findById(offeringId);
    if (!offering) {
      return res.status(404).json({ error: "Offering not found" });
    }

    // Fetch waitlisted users
    const waitlistedUsers = await User.find({
      uid: { $in: offering.waitingList }
    });

    // Create a mapping of user IDs to quick messages
    const quickMessages = {};
    offering.quickMessage.forEach(msg => {
      if (offering.waitingList.includes(msg.userid)) {
        quickMessages[msg.userid] = msg;
      }
    });

    // Send the users and their quick messages back in the response
    res.json({ waitingList: waitlistedUsers, quickMessages });

  } catch (error) {
    console.error("Error fetching waitlisted users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch accepted users for a specific offering
router.get("/api/offering/:offeringId/accepted-users", verifyToken, async (req, res) => {
  const { offeringId } = req.params;

  try {
    // Find the offering
    const offering = await Offering.findById(offeringId);
    if (!offering) {
      return res.status(404).json({ error: "Offering not found" });
    }

    // Fetch accepted users
    const acceptedUsers = await User.find({
      uid: { $in: offering.acceptedUsers }
    });

    // Create a mapping of user IDs to quick messages
    const quickMessages = {};
    offering.quickMessage.forEach(msg => {
      if (offering.acceptedUsers.includes(msg.userid)) {
        quickMessages[msg.userid] = msg;
      }
    });

    res.json({ 
      acceptedUsers, 
      quickMessages,
      availableSeats: offering.maxSeats
    });
  } catch (error) {
    console.error("Error fetching accepted users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/offering/:offeringId/accept-user", verifyToken, async (req, res) => {
  const { offeringId } = req.params;
  const { userId } = req.body; // ID of the user to be moved to accepted
  
  try {
    // Find the offering by ID
    const offering = await Offering.findById(offeringId);
    if (!offering) {
      return res.status(404).json({ error: "Offering not found" });
    }

    // Check if there are available seats
    if (offering.maxSeats <= 0) {
      return res.status(400).json({ 
        error: "No available seats", 
        details: "Maximum capacity reached" 
      });
    }

    // Check if the user is on the waiting list
    const waitlistIndex = offering.waitingList.indexOf(userId);
    if (waitlistIndex === -1) {
      return res.status(400).json({ error: "User is not on the waiting list" });
    }

    // Find the quick message for this user
    const userQuickMessage = offering.quickMessage.find(msg => msg.userid === userId);
    
    // Remove the user from the waiting list
    offering.waitingList.splice(waitlistIndex, 1);

    // Add the user to the accepted users list
    offering.acceptedUsers.push(userId);

    // Decrease available seats by 1
    offering.maxSeats -= 1;

    // Save the updated offering
    await offering.save();

    // Respond with success message
    res.json({ 
      message: "User moved to accepted users",
      availableSeats: offering.maxSeats
    });

  } catch (error) {
    console.error("Error accepting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch accepted users for a specific offering
router.get("/api/offering/:offeringId/accepted-users", verifyToken, async (req, res) => {
  const { offeringId } = req.params;

  try {
    // Find the offering
    const offering = await Offering.findById(offeringId);
    if (!offering) {
      return res.status(404).json({ error: "Offering not found" });
    }

    // Fetch accepted users
    const acceptedUsers = await User.find({
      uid: { $in: offering.acceptedUsers }
    });

    // Create a mapping of user IDs to quick messages from the offering
    const quickMessages = acceptedUsers.reduce((acc, user) => {
      const messageIndex = offering.acceptedUsers.indexOf(user.uid);
      if (messageIndex !== -1 && offering.quickMessage[messageIndex]) {
        acc[user.uid] = offering.quickMessage[messageIndex];
      }
      return acc;
    }, {});

    res.json({ 
      acceptedUsers, 
      quickMessages,
      availableSeats: offering.maxSeats
    });
  } catch (error) {
    console.error("Error fetching accepted users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove a user from the accepted users list
router.delete("/api/offering/:offeringId/remove-accepted-user", verifyToken, async (req, res) => {
  const { offeringId } = req.params;
  const { user } = req.body; // User to be removed from accepted users list

  try {
    // Find the offering by ID
    const offering = await Offering.findById(offeringId);
    if (!offering) {
      return res.status(404).json({ error: "Offering not found" });
    }

    // Check if the user is in the accepted users list
    const acceptedUserIndex = offering.acceptedUsers.indexOf(user);
    if (acceptedUserIndex === -1) {
      return res.status(400).json({ error: "User not in accepted list" });
    }

    // Remove the user from the accepted users list
    offering.acceptedUsers.splice(acceptedUserIndex, 1);

    // Delete the quick messages associated with the user
    offering.quickMessage = offering.quickMessage.filter(msg => msg.userid !== user);

    // Increase available seats by 1, but not exceeding the original maxSeats
    const originalMax = offering.originalMaxSeats || offering.maxSeats + offering.acceptedUsers.length;
    offering.maxSeats = Math.min(offering.maxSeats + 1, originalMax);

    // Save the updated offering with removed user and quick messages
    await offering.save();

    // Respond with success message
    res.json({ 
      message: "User removed from accepted users and their quick messages deleted",
      availableSeats: offering.maxSeats
    });
  } catch (error) {
    console.error("Error removing user from accepted users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update the Offering schema to include originalMaxSeats field
router.post("/api/update-offering-schema", verifyToken, async (req, res) => {
  try {
    // This route is to update existing offerings to include the originalMaxSeats field
    const offerings = await Offering.find({ originalMaxSeats: { $exists: false } });
    
    for (const offering of offerings) {
      // Calculate originalMaxSeats based on current maxSeats and acceptedUsers count
      offering.originalMaxSeats = offering.maxSeats + offering.acceptedUsers.length;
      await offering.save();
    }
    
    res.json({ 
      message: `Updated ${offerings.length} offerings with originalMaxSeats field`
    });
  } catch (error) {
    console.error("Error updating offering schema:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete an offering by ID
router.delete("/api/delete-offering/:offeringId", verifyToken, async (req, res) => {
  const { offeringId } = req.params;
  const userId = req.user.uid;

  try {
    const offeringObjectId = new mongoose.Types.ObjectId(offeringId); // Convert to ObjectId

    // Check if the offering exists and belongs to the authenticated user
    const offering = await Offering.findOne({ _id: offeringObjectId, userid: userId });

    if (!offering) {
      return res.status(404).json({ error: "Offering not found or unauthorized" });
    }

    // Remove offering ID from all users' favoriteOfferings arrays
    const result = await User.updateMany(
      { favoriteOfferings: offeringObjectId },
      { $pull: { favoriteOfferings: offeringObjectId } }
    );

    console.log(`Removed from ${result.modifiedCount} user(s)`);

    // Delete the offering
    await Offering.deleteOne({ _id: offeringObjectId });

    res.json({ message: "Offering deleted and removed from users' favorites successfully!" });
  } catch (error) {
    console.error("Error deleting offering:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


module.exports = router;
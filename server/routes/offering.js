const express = require("express");
const Offering = require("../models/Offering-schema");
const User = require("../models/User-schema");
const verifyToken = require("../middleware/verifyToken");
const mongoose = require("mongoose");
const emailEvents = require('../emailEvents');


const router = express.Router();

// Create a new offering with waiting list functionality
router.post("/api/create-offering", verifyToken, async (req, res) => {
  const {
    name,
    longitude,
    latitude,
    arrivaldate,
    arrivaltime,
    notes,
    maxSeats,
    formattedAddress,
  } = req.body;
  const userId = req.user.uid;

  // Validate maxSeats
  if (!maxSeats || maxSeats <= 0) {
    return res.status(400).json({
      error: "Invalid maxSeats value",
      details: "maxSeats must be a positive number",
    });
  }

  try {
    // Validate coordinates
    if (
      typeof longitude !== "number" ||
      typeof latitude !== "number" ||
      isNaN(longitude) ||
      isNaN(latitude) ||
      Math.abs(longitude) > 180 ||
      Math.abs(latitude) > 90
    ) {
      return res.status(400).json({
        error: "Invalid coordinates",
        details:
          "Longitude must be between -180 and 180, Latitude between -90 and 90",
      });
    }

    // Validate date
    const arrivalDate = new Date(arrivaldate);
    if (isNaN(arrivalDate.getTime())) {
      return res.status(400).json({ error: "Invalid arrival date" });
    }

    // Check time format: HH:MM (24-hour)
    if (
      !arrivaltime ||
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(arrivaltime)
    ) {
      return res.status(400).json({
        error: "Invalid arrival time",
        details: "Time must be in format HH:MM (24-hour format)",
      });
    }

    // Only check if it's in the past *if* the date is today
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // "YYYY-MM-DD"

    if (arrivaldate === todayStr) {
      // Convert arrival time string to a Date object for today
      const [hours, minutes] = arrivaltime.split(":").map(Number);
      const arrivalDateTime = new Date();
      arrivalDateTime.setHours(hours, minutes, 0, 0);

      if (arrivalDateTime < now) {
        return res.status(400).json({
          error: "Invalid arrival time",
          details: "Arrival time cannot be in the past",
        });
      }
    }

    // Ensure the user exists
    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has a vehicle registered
    if (!user.vehicleid) {
      return res
        .status(400)
        .json({ error: "You must register a vehicle first" });
    }

    // Create the GeoJSON point
    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
      ...(formattedAddress && { formattedAddress }),
    };

    // Create and save the new offering
    const newOffering = new Offering({
      userid: userId,
      name,
      location,
      arrivaldate: arrivalDate,
      arrivaltime,
      vehicleid: user.vehicleid,
      notes: notes || "",
      maxSeats,
      originalMaxSeats: maxSeats,
      waitingList: [],
      acceptedUsers: [],
      quickMessage: [],
    });

    const savedOffering = await newOffering.save();
    await emailEvents.onOfferCreated(userId);


    res.status(201).json({
      message: "Offering created successfully",
      offering: savedOffering,
    });
  } catch (error) {
    console.error("Error creating offering:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Get all offerings for the authenticated user
router.get("/api/offerings", verifyToken, async (req, res) => {
  try {
    const offerings = await Offering.find({ userid: req.user.uid }).sort({
      createdAt: -1,
    });
    res.json(offerings);
  } catch (error) {
    console.error("Error fetching offerings:", error);
    res.status(500).json({ error: "Failed to fetch offerings" });
  }
});

// Get a specific offering by ID
router.get("/api/offering/:id", verifyToken, async (req, res) => {
  try {
    const offering = await Offering.findOne({
      _id: req.params.id,
      userid: req.user.uid,
    });

    if (!offering) {
      return res.status(404).json({ error: "Offering not found" });
    }

    res.json(offering);
  } catch (error) {
    console.error("Error fetching offering:", error);
    res.status(500).json({ error: "Failed to fetch offering" });
  }
});

// Update an offering
router.put("/api/offering/:id", verifyToken, async (req, res) => {
  const { name, longitude, latitude, arrivaldate, arrivaltime, notes } =
    req.body;

  try {
    // Validate coordinates if provided
    if (longitude !== undefined || latitude !== undefined) {
      if (
        typeof longitude !== "number" ||
        typeof latitude !== "number" ||
        isNaN(longitude) ||
        isNaN(latitude) ||
        Math.abs(longitude) > 180 ||
        Math.abs(latitude) > 90
      ) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
    }

    // Validate time format if provided
    if (
      arrivaltime !== undefined &&
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(arrivaltime)
    ) {
      return res.status(400).json({
        error: "Invalid arrival time (Is it in the past?)",
        details: "Time must be in format HH:MM (24-hour format)",
      });
    }

    // Validate that the updated arrival date and time are not in the past
    if (arrivaldate || arrivaltime) {
      const offering = await Offering.findById(req.params.id);
      if (!offering) {
        return res.status(404).json({ error: "Offering not found" });
      }

      const updatedDate = arrivaldate
        ? new Date(arrivaldate)
        : offering.arrivaldate;
      const updatedTime = arrivaltime || offering.arrivaltime;
      const [hours, minutes] = updatedTime.split(":").map(Number);

      const fullArrivalDate = new Date(updatedDate);
      fullArrivalDate.setHours(hours, minutes, 0, 0);

      const now = new Date();
      if (fullArrivalDate < now) {
        return res.status(400).json({
          error: "Invalid arrival time (Is it in the past?)",
          details: "Arrival date and time cannot be in the past",
        });
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(longitude !== undefined &&
        latitude !== undefined && {
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        }),
      ...(arrivaldate && { arrivaldate: new Date(arrivaldate) }),
      ...(arrivaltime !== undefined && { arrivaltime }),
      ...(notes !== undefined && { notes }),
    };

    const updatedOffering = await Offering.findOneAndUpdate(
      { _id: req.params.id, userid: req.user.uid },
      updateData,
      { new: true }
    );

    if (!updatedOffering) {
      return res.status(404).json({ error: "Offering not found" });
    }

    res.json({
      message: "Offering updated successfully",
      offering: updatedOffering,
    });
  } catch (error) {
    console.error("Error updating offering:", error);
    res.status(500).json({ error: "Failed to update offering" });
  }
});

// Delete an offering
router.delete("/api/offering/:id", verifyToken, async (req, res) => {
  try {
    const deletedOffering = await Offering.findOneAndDelete({
      _id: req.params.id,
      userid: req.user.uid,
    });

    if (!deletedOffering) {
      return res.status(404).json({ error: "Offering not found" });
    }

    res.json({ message: "Offering deleted successfully" });
  } catch (error) {
    console.error("Error deleting offering:", error);
    res.status(500).json({ error: "Failed to delete offering" });
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
      return res
        .status(400)
        .json({ error: "You have already requested this ride." });
    }

    // Add user ID to the waiting list
    offering.waitingList.push(userId);

    // Add the user ID and message to the quickMessage array
    offering.quickMessage.push({
      message: message,
      userid: userId,
    });

    await offering.save();
    await emailEvents.onUserWantsToJoin(offeringId, userId);


    res.json({ message: "Successfully added to waiting list." });
  } catch (error) {
    console.error("Error adding to waiting list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get waitlisted users for a specific offering
router.get(
  "/api/offering/:offeringId/waitlist",
  verifyToken,
  async (req, res) => {
    const { offeringId } = req.params;

    try {
      const offering = await Offering.findById(offeringId);
      if (!offering) {
        return res.status(404).json({ error: "Offering not found" });
      }

      const waitlistedUsers = await User.find({
        uid: { $in: offering.waitingList },
      });

      const quickMessages = {};
      offering.quickMessage.forEach((msg) => {
        if (offering.waitingList.includes(msg.userid)) {
          quickMessages[msg.userid] = msg;
        }
      });

      res.json({ waitingList: waitlistedUsers, quickMessages });
    } catch (error) {
      console.error("Error fetching waitlisted users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Accept user from waiting list
router.post(
  "/api/offering/:offeringId/accept-user",
  verifyToken,
  async (req, res) => {
    const { offeringId } = req.params;
    const { userId } = req.body;

    try {
      const offering = await Offering.findById(offeringId);
      if (!offering) {
        return res.status(404).json({ error: "Offering not found" });
      }

      if (offering.maxSeats <= 0) {
        return res.status(400).json({
          error: "No available seats",
          details: "Maximum capacity reached",
        });
      }

      const waitlistIndex = offering.waitingList.indexOf(userId);
      if (waitlistIndex === -1) {
        return res
          .status(400)
          .json({ error: "User is not on the waiting list" });
      }

      const userQuickMessage = offering.quickMessage.find(
        (msg) => msg.userid === userId
      );

      offering.waitingList.splice(waitlistIndex, 1);
      offering.acceptedUsers.push(userId);
      offering.maxSeats -= 1;

      await offering.save();
      await emailEvents.onRequestAccepted(offering.userid, userId);


      res.json({
        message: "User moved to accepted users",
        availableSeats: offering.maxSeats,
      });
    } catch (error) {
      console.error("Error accepting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get accepted users for an offering
router.get(
  "/api/offering/:offeringId/accepted-users",
  verifyToken,
  async (req, res) => {
    const { offeringId } = req.params;

    try {
      const offering = await Offering.findById(offeringId);
      if (!offering) {
        return res.status(404).json({ error: "Offering not found" });
      }

      const acceptedUsers = await User.find({
        uid: { $in: offering.acceptedUsers },
      });

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
        availableSeats: offering.maxSeats,
      });
    } catch (error) {
      console.error("Error fetching accepted users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Remove user from accepted list
router.delete(
  "/api/offering/:offeringId/remove-accepted-user",
  verifyToken,
  async (req, res) => {
    const { offeringId } = req.params;
    const { user } = req.body;

    try {
      const offering = await Offering.findById(offeringId);
      if (!offering) {
        return res.status(404).json({ error: "Offering not found" });
      }

      const acceptedUserIndex = offering.acceptedUsers.indexOf(user);
      if (acceptedUserIndex === -1) {
        return res.status(400).json({ error: "User not in accepted list" });
      }

      offering.acceptedUsers.splice(acceptedUserIndex, 1);
      offering.quickMessage = offering.quickMessage.filter(
        (msg) => msg.userid !== user
      );

      const originalMax =
        offering.originalMaxSeats ||
        offering.maxSeats + offering.acceptedUsers.length;
      offering.maxSeats = Math.min(offering.maxSeats + 1, originalMax);

      await offering.save();
      await emailEvents.onRiderRemoved(user, offering.userid);


      res.json({
        message: "User removed from accepted users",
        availableSeats: offering.maxSeats,
      });
    } catch (error) {
      console.error("Error removing user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update schema for existing offerings
router.post("/api/update-offering-schema", verifyToken, async (req, res) => {
  try {
    const offerings = await Offering.find({
      originalMaxSeats: { $exists: false },
    });

    for (const offering of offerings) {
      offering.originalMaxSeats =
        offering.maxSeats + offering.acceptedUsers.length;
      await offering.save();
    }

    res.json({
      message: `Updated ${offerings.length} offerings with originalMaxSeats field`,
    });
  } catch (error) {
    console.error("Error updating schema:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete offering and cleanup references
router.delete(
  "/api/delete-offering/:offeringId",
  verifyToken,
  async (req, res) => {
    const { offeringId } = req.params;
    const userId = req.user.uid;

    try {
      const offeringObjectId = new mongoose.Types.ObjectId(offeringId);

      const offering = await Offering.findOne({
        _id: offeringObjectId,
        userid: userId,
      });
      if (!offering) {
        return res
          .status(404)
          .json({ error: "Offering not found or unauthorized" });
      }

      await User.updateMany(
        { favoriteOfferings: offeringObjectId },
        { $pull: { favoriteOfferings: offeringObjectId } }
      );

      await Offering.deleteOne({ _id: offeringObjectId });

      await emailEvents.onOfferCancelled(userId, offering.acceptedUsers);
      res.json({ message: "Offering deleted successfully" });
    } catch (error) {
      console.error("Error deleting offering:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Cancel a waiting list request
router.post("/api/offering/:offeringId/cancel-waitlist-request", verifyToken, async (req, res) => {
  const { offeringId } = req.params;
  const userId = req.user.uid;
  const { userId: requestedUserId } = req.body;
  
  // Ensure the requesting user can only cancel their own request
  const userIdToRemove = userId === requestedUserId ? userId : userId;

  try {
    const offering = await Offering.findById(offeringId);
    if (!offering) {
      return res.status(404).json({ error: "Offering not found" });
    }

    // Check if user is in waiting list
    const waitlistIndex = offering.waitingList.indexOf(userIdToRemove);
    if (waitlistIndex === -1) {
      return res.status(400).json({ error: "User is not on the waiting list" });
    }

    // Remove from waiting list
    offering.waitingList.splice(waitlistIndex, 1);
    
    // Remove any quick message from this user
    offering.quickMessage = offering.quickMessage.filter(
      (msg) => msg.userid !== userIdToRemove
    );

    await offering.save();
    await emailEvents.onJoinRequestCancelled(userIdToRemove, offering.userid);


    res.json({
      message: "Successfully removed from waiting list",
      offering: {
        waitingList: offering.waitingList,
        maxSeats: offering.maxSeats
      }
    });

  } catch (error) {
    console.error("Error canceling waiting list request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Cancel accepted ride request
router.post("/api/offering/:offeringId/cancel-accepted-user", verifyToken, async (req, res) => {
  const { offeringId } = req.params;
  const userId = req.user.uid;
  const { userId: requestedUserId } = req.body;
  
  // Ensure the requesting user can only cancel their own acceptance
  const userIdToRemove = userId === requestedUserId ? userId : userId;

  try {
    const offering = await Offering.findById(offeringId);
    if (!offering) {
      return res.status(404).json({ error: "Offering not found" });
    }

    // Check if user is in accepted list
    const acceptedIndex = offering.acceptedUsers.indexOf(userIdToRemove);
    if (acceptedIndex === -1) {
      return res.status(400).json({ error: "User is not in the accepted list" });
    }

    // Remove from accepted list
    offering.acceptedUsers.splice(acceptedIndex, 1);
    
    // Remove any quick message from this user
    offering.quickMessage = offering.quickMessage.filter(
      (msg) => msg.userid !== userIdToRemove
    );
    
    // Free up a seat
    const originalMax = offering.originalMaxSeats || (offering.maxSeats + offering.acceptedUsers.length + 1);
    offering.maxSeats = Math.min(offering.maxSeats + 1, originalMax);

    await offering.save();

    await offering.save();

// ✅ Send email to both rider and offer host
await emailEvents.onRideRequestCancelled(userId, offering.userid);


    res.json({
      message: "Successfully canceled accepted ride",
      offering: {
        acceptedUsers: offering.acceptedUsers,
        maxSeats: offering.maxSeats
      }
    });

  } catch (error) {
    console.error("Error canceling accepted ride:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;

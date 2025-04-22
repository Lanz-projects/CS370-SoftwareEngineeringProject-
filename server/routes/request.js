const express = require("express");
const Request = require("../models/Request-schema");
const User = require("../models/User-schema.js");
const verifyToken = require("../middleware/verifyToken");
const mongoose = require("mongoose");
const emailEvents = require('../emailEvents');

const router = express.Router();

// Create a new request
router.post("/api/create-request", verifyToken, async (req, res) => {
  const { name, latitude, longitude, arrivaldate, arrivaltime, notes, wants, formattedAddress } = req.body;
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

  // Validate coordinates range
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) {
    return res.status(400).json({
      error: "Invalid coordinates",
      details: "Longitude must be between -180 and 180, Latitude between -90 and 90"
    });
  }

  // Validate date
  const arrivalDate = new Date(arrivaldate);
  if (isNaN(arrivalDate.getTime())) {
    return res.status(400).json({ error: "Invalid arrival date" });
  }

  // Check time format: HH:MM (24-hour)
  if (arrivaltime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(arrivaltime)) {
    return res.status(400).json({
      error: "Invalid arrival time",
      details: "Time must be in format HH:MM (24-hour format)"
    });
  }

  // Only check if it's in the past *if* the date is today
  if (arrivaltime) {
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
          details: "Arrival time cannot be in the past"
        });
      }
    }
  }

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
        coordinates: [lng, lat],
        formattedAddress
      },
      arrivaldate: arrivalDate,
      arrivaltime: arrivaltime || "",
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
    // Save the new request
await newRequest.save();

// ✅ Send confirmation email
await emailEvents.onRequestSubmitted(userId);

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

// Update a request
router.put("/api/update-request/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;
  const { name, latitude, longitude, arrivaldate, arrivaltime, notes, wants, formattedAddress } = req.body;

  try {
    // Find the request to update
    const request = await Request.findOne({ _id: id, userid: userId });
    if (!request) {
      return res.status(404).json({ error: "Request not found or unauthorized" });
    }

    // Validate coordinates if provided
    if (longitude !== undefined || latitude !== undefined) {
      const lng = longitude !== undefined ? parseFloat(longitude) : request.location.coordinates[0];
      const lat = latitude !== undefined ? parseFloat(latitude) : request.location.coordinates[1];
      
      if (isNaN(lng) || isNaN(lat) || Math.abs(lng) > 180 || Math.abs(lat) > 90) {
        return res.status(400).json({ 
          error: "Invalid coordinates",
          details: "Longitude must be between -180 and 180, Latitude between -90 and 90"
        });
      }
    }

    // Validate time format if provided
    if (arrivaltime !== undefined && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(arrivaltime)) {
      return res.status(400).json({
        error: "Invalid arrival time",
        details: "Time must be in format HH:MM (24-hour format)"
      });
    }

    // Validate that the updated arrival date and time are not in the past
    if (arrivaldate || arrivaltime) {
      const updatedDate = arrivaldate ? new Date(arrivaldate) : request.arrivaldate;
      const updatedTime = arrivaltime || request.arrivaltime;
      
      if (updatedTime) {
        const [hours, minutes] = updatedTime.split(":").map(Number);
        const fullArrivalDate = new Date(updatedDate);
        fullArrivalDate.setHours(hours, minutes, 0, 0);

        const now = new Date();
        if (fullArrivalDate < now) {
          return res.status(400).json({
            error: "Invalid arrival time",
            details: "Arrival date and time cannot be in the past"
          });
        }
      }
    }

    // Build update object
    const updateData = {};
    
    if (name) updateData.name = name;
    if (notes !== undefined) updateData.notes = notes;
    if (wants !== undefined) updateData.wants = wants;
    if (arrivaldate) updateData.arrivaldate = new Date(arrivaldate);
    if (arrivaltime !== undefined) updateData.arrivaltime = arrivaltime;
    
    // Update location if coordinates provided
    if (longitude !== undefined && latitude !== undefined) {
      updateData.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
      if (formattedAddress) {
        updateData.location.formattedAddress = formattedAddress;
      }
    }

    // Update the request
    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Request updated successfully",
      request: updatedRequest
    });
  } catch (error) {
    console.error("Error updating request:", error);
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

    if (request.userAccepted) {
      await emailEvents.onRequestPostCancelled(userId, request.userAccepted);
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
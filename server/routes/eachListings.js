const express = require("express");
const Offering = require("../models/Offering-schema"); 
const Request = require("../models/Request-schema"); 
const User = require("../models/User-schema");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

// GET route to fetch all offerings
router.get("/all-offerings", async (req, res) => {
  try {
    // Fetch all offerings from the Offering schema
    const offerings = await Offering.find({});
    res.status(200).json({ offerings });
  } catch (error) {
    console.error("Error fetching offerings:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET route to fetch all requests
router.get("/all-requests", async (req, res) => {
  try {
    // Fetch all requests from the Request schema
    const requests = await Request.find({});
    res.status(200).json({ requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get the 5 most recent offerings and requests from all users in the database
router.get("/api/recent-data", verifyToken, async (req, res) => {
  try {
    // Fetch the 5 most recent offerings sorted by createdTime
    const offerings = await Offering.find({}).sort({ createdTime: -1 }).limit(5);
    
    // Fetch the 5 most recent requests sorted by createdTime
    const requests = await Request.find({}).sort({ createdTime: -1 }).limit(5);

    // Combine offerings and requests into a single object
    const recentData = {
      offerings,
      requests
    };

    res.json(recentData); // Return the 5 most recent offerings and requests in one response
  } catch (error) {
    console.error("Error fetching recent data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Gets the each of the users favorites from offerings and requesting
router.get("/api/favorites", verifyToken, async (req, res) => {
  const userUid = req.user.uid; // Get the user UID from the decoded token

  try {
    // Find the user by UID and populate the favorite requests and offerings
    const user = await User.findOne({ uid: userUid })
      .populate("favoriteRequests")
      .populate("favoriteOfferings"); 

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If no favorites are found, return an empty response
    const favorites = {
      favoriteRequests: user.favoriteRequests || [],
      favoriteOfferings: user.favoriteOfferings || [],
    };
    //console.log(favorites);
    // Respond with the user's favorite requests and offerings
    res.status(200).json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Gets the each of the users favorite's ids from offerings and requesting
router.get("/api/favorites-ids", verifyToken, async (req, res) => {
  const userUid = req.user.uid; // Get the user UID from the decoded token

  try {
    // Find the user by UID 
    const user = await User.findOne({ uid: userUid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If no favorites id are found, return an empty response
    const favorites = {
      favoriteRequestsID: user.favoriteRequests || [],
      favoriteOfferingsID: user.favoriteOfferings || [],
    };
    //console.log(favorites);
    // Respond with the user's favorite requests and offerings ids
    res.status(200).json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;

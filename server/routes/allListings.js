const express = require("express");
const Offering = require("../models/Offering-schema"); // Import the Offering schema
const Request = require("../models/Request-schema"); // Import the Request schema
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Get all offerings and requests from all users in the database
router.get("/api/all-data", verifyToken, async (req, res) => {
  try {
    // Fetch all offerings from the Offering schema
    const offerings = await Offering.find({});
    
    // Fetch all requests from the Request schema
    const requests = await Request.find({});

    // Combine offerings and requests into a single object
    const allData = {
      offerings,
      requests
    };

    // Log the fetched data to the console
    //console.log("All Offerings:", offerings);
    //console.log("All Requests:", requests);

    res.json(allData); // Return both offerings and requests in one response
  } catch (error) {
    console.error("Error fetching all data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

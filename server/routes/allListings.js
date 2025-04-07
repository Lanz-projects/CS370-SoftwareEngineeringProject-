const express = require("express");
const Offering = require("../models/Offering-schema");
const Request = require("../models/Request-schema");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// Add timeout middleware
router.use((req, res, next) => {
  res.setTimeout(10000, () => { // 10 second timeout
    res.status(504).json({ error: "Request timeout" });
  });
  next();
});

router.get("/api/all-data", verifyToken, async (req, res) => {
  try {
    // Use Promise.all for parallel fetching with error handling
    const [offerings, requests] = await Promise.all([
      Offering.find({}).maxTimeMS(5000), // 5 second timeout
      Request.find({}).maxTimeMS(5000)
    ]);

    res.json({ offerings, requests });
  } catch (error) {
    console.error("Error fetching all data:", error);
    
    // Specific error handling
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ error: "Database connection error" });
    }
    if (error.name === 'MongoTimeoutError') {
      return res.status(504).json({ error: "Database operation timed out" });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
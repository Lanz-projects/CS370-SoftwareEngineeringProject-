const express = require("express");
const Offering = require("../models/Offering-schema"); 
const Request = require("../models/Request-schema"); 
const router = express.Router();

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

module.exports = router;

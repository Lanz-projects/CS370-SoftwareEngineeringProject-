const express = require('express');
const User = require('../models/User-schema'); // Assuming you have the User model
const verifyToken = require('../middleware/verifyToken'); // Middleware for token verification

const router = express.Router();

// Route to get user data 
router.get("/api/user", verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email; 
    const user = await User.findOne({ email: userEmail });

    if (!user){
      return res.status(404).json({ error: "User not found" });
    } 

    res.json({ acceptedUserAgreement: user.acceptedUserAgreement });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Route to update user agreement status 
router.post("/api/user/agreement", verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email; // Access email from the decoded token
    await User.updateOne({ email: userEmail }, { acceptedUserAgreement: true });

    res.json({ message: "User agreement accepted." });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

const express = require('express');
const User = require('../models/User-schema'); 
const verifyToken = require('../middleware/verifyToken'); 

const router = express.Router();

router.post("/api/update-user-info", verifyToken, async (req, res) => {
  const { name, contactInfos } = req.body; // Extract name and contact info from the request body
  const userId = req.user.uid;  

  try {
    // Find the user in the database
    const user = await User.findOne({ uid: userId });

    // If user is not found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's name and contact info
    user.name = name;
    user.contactInfo = contactInfos;  // Replace the old contact info with the new array
    user.completedUserProfile = true;
    // Save the updated user document
    await user.save();

    // Respond with success
    res.json({ message: "User info updated successfully!" });
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

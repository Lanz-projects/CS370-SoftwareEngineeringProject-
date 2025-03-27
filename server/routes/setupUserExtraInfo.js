const express = require('express');
const User = require('../models/User-schema'); 
const verifyToken = require('../middleware/verifyToken'); 

const router = express.Router();

router.post("/api/update-user-info", verifyToken, async (req, res) => {
  const { name, contactInfos } = req.body;
  const userId = req.user.uid;

  try {
    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    for (let contact of contactInfos) {
      if (contact.type === "social" && !contact.platform) {
        return res.status(400).json({ error: "Platform is required for social contacts." });
      }
    }

    user.name = name;
    user.contactInfo = contactInfos;
    user.completedUserProfile = true;

    await user.save();
    res.json({ message: "User info updated successfully!" });
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
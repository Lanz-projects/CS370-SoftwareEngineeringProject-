const express = require('express');
const admin = require('firebase-admin');
const User = require('../models/User-schema'); // Import the User model
const Vehicle = require('../models/Vehicle-schema'); // Import the Vehicle model
const verifyToken = require('../middleware/verifyToken'); // Ensure users are authenticated

const router = express.Router();

// Signup route
router.post('/api/signup', async (req, res) => {
  const { token, email } = req.body;

  try {
    // Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.email !== email) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = new User({ 
      uid: decodedToken.uid, 
      email 
    });
    await newUser.save(); 

    res.status(201).json({ message: 'Google signup successful!', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error during signup: ' + error.message });
  }
});

// Check if a user exists
router.post('/api/check-user', async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ error: "User does not exist." });
    }

    res.status(200).json({ message: "User exists." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while checking user." });
  }
});

// Delete a user and associated vehicle (Cascading Deletion)
router.delete('/api/delete-user', verifyToken, async (req, res) => {
  const userId = req.user.uid; // Get user ID from the decoded token

  try {
    // Find the user by UID
    const user = await User.findOne({ uid: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete associated vehicle if exists
    if (user.vehicleid) {
      await Vehicle.findByIdAndDelete(user.vehicleid); // Delete the vehicle by its ID
    }

    // Delete the user from the database
    await User.findOneAndDelete({ uid: userId });

    res.json({ message: "User and associated vehicle deleted successfully!" });

  } catch (error) {
    console.error("Error deleting user and vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

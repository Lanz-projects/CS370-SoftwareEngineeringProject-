const express = require('express');
const admin = require('firebase-admin');
const User = require('../models/User-schema'); // Import the User model

const router = express.Router();

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
module.exports = router;

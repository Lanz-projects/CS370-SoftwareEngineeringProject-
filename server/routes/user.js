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

      const newUser = new User({ email });
      await newUser.save(); 

      res.status(201).json({ message: 'Google signup successful!', user: newUser });
  } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Error during signup: ' + error.message });
  }
});


module.exports = router;

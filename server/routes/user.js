const express = require("express");
const admin = require("firebase-admin");
const User = require("../models/User-schema"); // Import the User model
const Vehicle = require("../models/Vehicle-schema"); // Import the Vehicle model
const Offering = require("../models/Offering-schema");
const Request = require("../models/Request-schema");
const verifyToken = require("../middleware/verifyToken"); // Ensure users are authenticated

const router = express.Router();

// Signup route
router.post("/api/signup", async (req, res) => {
  const { token, email } = req.body;

  try {
    // Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.email !== email) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const newUser = new User({
      uid: decodedToken.uid,
      email,
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: "Google signup successful!", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error during signup: " + error.message });
  }
});

// Check if a user exists
router.post("/api/check-user", async (req, res) => {
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
router.delete("/api/delete-user", verifyToken, async (req, res) => {
  const userId = req.user.uid; // Get user ID from the decoded token

  try {
    // Find the user by UID
    const user = await User.findOne({ uid: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete associated offerings and requests
    await Offering.deleteMany({ userid: userId });
    await Request.deleteMany({ userid: userId });

    // Delete associated vehicle if exists
    if (user.vehicleid) {
      await Vehicle.findByIdAndDelete(user.vehicleid);
    }

    // Delete the user from MongoDB
    await User.findOneAndDelete({ uid: userId });

    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(userId);

    res.json({
      message: "User deleted from Firebase and database successfully!",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch user data
router.get("/api/user", verifyToken, async (req, res) => {
  const userId = req.user.uid; // Get user ID from the decoded token

  try {
    // Find the user by UID and populate the associated vehicle data
    const user = await User.findOne({ uid: userId }).populate("vehicleid");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with the user data, including their vehicle and contact info
    res.status(200).json({
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        vehicle: user.vehicleid,
        contactInfo: user.contactInfo,
        completedUserProfile: user.completedUserProfile,
        acceptedUserAgreement: user.acceptedUserAgreement,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/api/user", verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { name, contactInfo } = req.body;

  if (!contactInfo || contactInfo.length === 0) {
    return res
      .status(400)
      .json({ error: "At least one contact info is required." });
  }

  try {
    const user = await User.findOne({ uid: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name;
    user.contactInfo = contactInfo;

    await user.save();

    res.status(200).json({ message: "User profile updated successfully!" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

const express = require("express");
const admin = require("firebase-admin");
const User = require("../models/User-schema"); // Import the User model
const Vehicle = require("../models/Vehicle-schema"); // Import the Vehicle model
const Offering = require("../models/Offering-schema");
const Request = require("../models/Request-schema");
const verifyToken = require("../middleware/verifyToken"); // Ensure users are authenticated
const emailEvents = require('../emailEvents');


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
    // ✅ Send welcome email
    await emailEvents.onAccountCreated(decodedToken.uid);


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
    console.log(user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Store user email BEFORE deleting anything
    const userEmail = user.email;


    // ✅ Send the account deletion email
    await emailEvents.onAccountDeleted(userEmail);

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

// Fetch request data along with user profile (specific fields) in request post
router.get("/api/request/:requestId", async (req, res) => {
  const { requestId } = req.params;

  try {
    // Find the request by its ID
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Find the user by their 'uid' (which is stored in 'userid') and populate 'vehicleid'
    const user = await User.findOne({ uid: request.userid })
      .select([
        "uid", 
        "email", 
        "name", 
        "vehicleid", 
        "contactInfo", 
        "completedUserProfile", 
        "acceptedUserAgreement", 
        "createdAt"
      ])
      .populate("vehicleid"); // Populate the 'vehicleid' field

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with the request and the specific user data
    res.status(200).json({
      request: {
        name: request.name,
        location: request.location,
        arrivaldate: request.arrivaldate,
        notes: request.notes,
        wants: request.wants,
        user: user // The populated user object, including vehicle info
      }
    });
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch offering data along with the user profile (specific fields) offering post
router.get("/api/offering/:offeringId", async (req, res) => {
  const { offeringId } = req.params;

  try {
    // Find the offering by its ID
    const offering = await Offering.findById(offeringId); 
    
    if (!offering) {
      return res.status(404).json({ error: "Offering not found" });
      
    }

    // Find the user by their 'uid' (which is stored in 'userid') and populate 'vehicleid'
    const user = await User.findOne({ uid: offering.userid })
      .select([
        "uid", 
        "email", 
        "name", 
        "vehicleid", 
        "contactInfo", 
        "completedUserProfile", 
        "acceptedUserAgreement", 
        "createdAt"
      ])
      .populate("vehicleid"); // Populate the 'vehicleid' field

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with the offering and the specific user data
    res.status(200).json({
      offering: {
        name: offering.name,
        location: offering.location,
        arrivaldate: offering.arrivaldate,
        notes: offering.notes,
        user: user // The populated user object, including vehicle info
      }
    });
  } catch (error) {
    console.error("Error fetching offering:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add an offering to user's favorite offerings
router.put("/api/user/favorite-offering", verifyToken, async (req, res) => {
  const { offeringId } = req.body;
  const userUid = req.user.uid; // Get the UID from the verified token

  try {
    // Find the user by UID
    const user = await User.findOne({ uid: userUid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add the offeringId to the favoriteOfferings array if it doesn't already exist
    if (!user.favoriteOfferings.includes(offeringId)) {
      user.favoriteOfferings.push(offeringId);
      await user.save();
    }

    res.status(200).json({ message: "Offering added to favorites" });
  } catch (error) {
    console.error("Error adding offering to favorites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a request to user's favorite requests
router.put("/api/user/favorite-request", verifyToken, async (req, res) => {
  const { requestId } = req.body; // requestId corresponds to the request the user wants to favorite
  const userUid = req.user.uid; // Get the UID from the verified token

  try {
    // Find the user by UID
    const user = await User.findOne({ uid: userUid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add the requestId to the favoriteRequests array if it doesn't already exist
    if (!user.favoriteRequests.includes(requestId)) {
      user.favoriteRequests.push(requestId);
      await user.save();
    }

    res.status(200).json({ message: "Request added to favorites" });
  } catch (error) {
    console.error("Error adding requesting to favorites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove an offering or request from user's favorites
router.put("/api/user/remove-favorite", verifyToken, async (req, res) => {
  const { offeringId, requestId, type } = req.body; // either offeringId or requestId, and the type ('offering' or 'request')
  const userUid = req.user.uid; // Get the UID from the verified token

  try {
    // Find the user by UID
    const user = await User.findOne({ uid: userUid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Depending on type, either handle offering or request
    let favoritesArray;
    let itemId;
    let message;

    if (type === 'offering') {
      favoritesArray = user.favoriteOfferings;
      itemId = offeringId;
      message = "Offering";
    } else if (type === 'request') {
      favoritesArray = user.favoriteRequests;
      itemId = requestId;
      message = "Request";
    } else {
      return res.status(400).json({ error: "Invalid type. Must be 'offering' or 'request'" });
    }

    // Remove the item from the favorites array
    const itemIndex = favoritesArray.indexOf(itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: `${message} not found in favorites` });
    }

    // Remove the item from the array
    favoritesArray.splice(itemIndex, 1);
    await user.save();

    res.status(200).json({ message: `${message} removed from favorites` });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;

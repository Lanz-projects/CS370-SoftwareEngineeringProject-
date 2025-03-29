const express = require('express');
const Request = require('../models/Request-schema');

const router = express.Router();

// Create a request with location coordinates
router.post('/api/create-request', async (req, res) => {
    try {
        const { userid, latitude, longitude, arrivaldate, notes, wants } = req.body;

        if (!userid || !latitude || !longitude) {
            return res.status(400).json({ error: "User ID, latitude, and longitude are required" });
        }

        const newRequest = new Request({
            userid,
            location: {
                type: "Point",
                coordinates: [longitude, latitude] // GeoJSON format (longitude first)
            },
            arrivaldate,
            notes,
            wants
        });

        await newRequest.save();
        res.status(201).json({ message: "Request created successfully!", request: newRequest });
    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).json({ error: "Error creating request" });
    }
});

module.exports = router;

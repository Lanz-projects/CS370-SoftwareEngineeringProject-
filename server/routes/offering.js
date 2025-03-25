const express = require('express');
const Offering = require('../models/Offering-schema');

const router = express.Router();

// Create an offering with location coordinates
router.post('/api/create-offering', async (req, res) => {
    try {
        const { latitude, longitude, arrivaldate, vehicleid, notes } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: "Latitude and longitude are required" });
        }

        const newOffering = new Offering({
            location: {
                type: "Point",
                coordinates: [longitude, latitude] // GeoJSON format (longitude first)
            },
            arrivaldate,
            vehicleid,
            notes
        });

        await newOffering.save();
        res.status(201).json({ message: "Offering created successfully!", offering: newOffering });
    } catch (error) {
        console.error("Error creating offering:", error);
        res.status(500).json({ error: "Error creating offering" });
    }
});

module.exports = router;

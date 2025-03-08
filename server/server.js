require('dotenv').config();
const express = require('express');
const connectDB = require('./mongoConfig'); // Import MongoDB connection function

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.send('Hello, MongoDB is connected!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

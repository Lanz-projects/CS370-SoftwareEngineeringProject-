require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./mongoConfig'); // Import MongoDB connection function

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// CORS Config
if (process.env.NODE_ENV === 'production') {
  // In production, specify your frontend domain
  app.use(cors({
    origin: 'https://domain.com',  // Replace with your production frontend URL
    credentials: true,
  }));
  //console.log("Production");
} else {
  // In development, allow requests from Vite's dev server (port 5173)
  app.use(cors({
    origin: 'http://localhost:5173',  // Vite dev server URL
    credentials: true,               // Allow sending cookies if needed
  }));
  //console.log("Development");
}

// Test Route
app.get('/', (req, res) => {
  res.send('Hello, MongoDB is connected!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

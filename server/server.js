require('dotenv').config();
const express = require('express');
const connectDB = require('./mongoConfig'); 
const cors = require('cors');
const admin = require('firebase-admin');
const userRoutes = require('./routes/user');
const userAgreementRoutes = require('./routes/userAgreement');
const setupUserExtraInfoRoutes = require('./routes/setupUserExtraInfo');
const vehicleFormRoutes = require('./routes/vehicleForm');
const offeringRoutes = require('./routes/offering');
const requestRoutes = require('./routes/request');
const allListingsRoutes = require('./routes/allListings');
const eachListingsRoutes = require('./routes/eachListings');

const app = express();
const PORT = process.env.PORT || 5000;

// Init Firebase Admin SDK
const serviceAccount = require('./firebase-adminsdk.json'); 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Connect to MongoDB
connectDB();

// CORS Options
const corsOptions = {
    origin: ["http://localhost:5173", "https://accounts.google.com"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Set Headers to Fix Firebase Authentication Issues
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});


// Use Routes
app.use(userRoutes);
app.use(userAgreementRoutes);
app.use(setupUserExtraInfoRoutes);
app.use(vehicleFormRoutes);
app.use(offeringRoutes);
app.use(requestRoutes);
app.use(allListingsRoutes);
app.use(eachListingsRoutes);


// Test Route
app.get('/', (req, res) => {
    res.send('Hello, MongoDB is connected!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

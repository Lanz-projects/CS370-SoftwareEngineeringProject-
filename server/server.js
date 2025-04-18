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
const cron = require('node-cron');
const cleanOrphanedData = require('./cron/cleanupOrphans');
const Offering = require('./models/Offering-schema');  // Corrected path to your Offering schema
const Request = require('./models/Request-schema');  // Corrected path to your Request schema


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
    // Run cleanup daily at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
    await cleanOrphanedData();
    });
  
});

cron.schedule('0 0 * * *', async () => {  // Runs at midnight every day
    console.log('Running cleanup for expired offerings and requests...');
    try {
        // Delete expired offerings (those older than 24 hours after the scheduled date)
        const expiredOfferings = await Offering.find({
            arrivaldate: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }  // 24 hours ago
        });

        if (expiredOfferings.length > 0) {
            for (const offering of expiredOfferings) {
                console.log(`Deleting expired offering: ${offering._id}`);
                await Offering.deleteOne({ _id: offering._id });
                console.log(`Deleted offering ${offering._id}`);
            }
        } else {
            console.log('No expired offerings found.');
        }

        // Delete expired requests (those older than 24 hours after the scheduled date)
        const expiredRequests = await Request.find({
            arrivaldate: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }  // 24 hours ago
        });

        if (expiredRequests.length > 0) {
            for (const request of expiredRequests) {
                console.log(`Deleting expired request: ${request._id}`);
                await Request.deleteOne({ _id: request._id });
                console.log(`Deleted request ${request._id}`);
            }
        } else {
            console.log('No expired requests found.');
        }
    } catch (err) {
        console.error('Error during offering/request cleanup:', err);
    }
});


// Start the cron job for account cleanup
require('./cron/accountCleanup');

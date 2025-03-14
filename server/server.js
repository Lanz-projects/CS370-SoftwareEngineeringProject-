require('dotenv').config();
const express = require('express');
const connectDB = require('./mongoConfig'); // Import MongoDB connection function
const cors = require('cors');
const admin = require('firebase-admin');
const userRoutes = require('./routes/user')

const app = express();
const PORT = process.env.PORT || 5000;

// Init Firebase Admin SDK
const serviceAccount = require('./firebase-adminsdk.json'); // Download your Firebase service account JSON
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Use Routes
app.use(userRoutes);


// Test Route
app.get('/', (req, res) => {
    res.send('Hello, MongoDB is connected!');
});



// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

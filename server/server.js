require('dotenv').config();
const express = require('express');
const connectDB = require('./mongoConfig'); 
const cors = require('cors');
const admin = require('firebase-admin');
const userRoutes = require('./routes/user');
const userAgreementRoutes = require('./routes/userAgreement');
const setupUserExtraInfoRoutes = require('./routes/setupUserExtraInfo');

const app = express();
const PORT = process.env.PORT || 5000;

// Init Firebase Admin SDK
const serviceAccount = require('./firebase-adminsdk.json'); // Download your Firebase service account JSON
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Connect to MongoDB
connectDB();

// Cors Options
const corsOptions = {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
  };

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Use Routes
app.use(userRoutes);
app.use(userAgreementRoutes);
app.use(setupUserExtraInfoRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Hello, MongoDB is connected!');
});


// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

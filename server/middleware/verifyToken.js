const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from "Bearer <token>"
  if (!token) {
    return res.status(401).send('No token provided');
  }

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach the decoded token to the request object
    req.user = decodedToken; // This contains the user data, including the email
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).send('Invalid or expired token');
  }
};

module.exports = verifyToken;

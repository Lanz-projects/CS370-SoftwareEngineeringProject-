// watchUpdates.js
const mongoose = require('mongoose');
const sendEmail = require('./emailSender');
require('dotenv').config();
const User = require('./models/User-schema');


// Watch for changes on the User collection
User.watch().on('change', async (change) => {
  console.log('🕵️ Change detected in User collection:', change);

  if (change.operationType === 'update') {
    const userId = change.documentKey._id;
    const updatedUser = await User.findById(userId);

    if (updatedUser && updatedUser.email) {
      const message = `Hi ${updatedUser.name}, your account info was just updated in our system.`;
      await sendEmail(updatedUser.email, 'Your Profile Was Updated', message);
    }
  }
});

// server/cron/accountCleanup.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User-schema');
const Offering = require('../models/Offering-schema');
const Request = require('../models/Request-schema');
const Vehicle = require('../models/Vehicle-schema');

// CHANGE THIS to the test UID you want to delete
const TEST_UID = '';

async function deleteUserAndAssociatedData(uid) {
  try {
    const user = await User.findOne({ uid });

    if (!user) {
      console.log(`[CRON] No user found with UID: ${uid}`);
      return;
    }

    const userId = user._id;

    console.log(`[CRON] Deleting user ${uid} and related data...`);

    await Promise.all([
        Offering.deleteMany({ userid: user.uid }),
        Request.deleteMany({ userid: user.uid }),
        Vehicle.deleteMany({ _id: user.vehicleid }),
        User.deleteOne({ _id: userId }),
    ]);
      

    console.log(`[CRON] Successfully deleted user ${uid} and all associated documents.`);
  } catch (err) {
    console.error('[CRON] Error during cleanup:', err);
  }
}

// Cron Schedule — runs once per minute
cron.schedule('* * * * *', async () => {
  console.log('[CRON] Running account cleanup job...');
  await deleteUserAndAssociatedData(TEST_UID);
});

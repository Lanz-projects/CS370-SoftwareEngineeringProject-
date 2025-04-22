const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User-schema');
const Offering = require('../models/Offering-schema');
const Request = require('../models/Request-schema');
const Vehicle = require('../models/Vehicle-schema');

const cleanOrphanedData = async () => {
  try {
    console.log('🔍 Cleaning orphaned data...');

    // Load all existing user IDs
    const existingUserIds = (await User.find({}, 'uid')).map(u => u.uid);

    // Offerings not tied to a valid user
    const orphanedOfferings = await Offering.find({ userid: { $nin: existingUserIds } });
    const orphanedRequests = await Request.find({ userid: { $nin: existingUserIds } });

    // Delete orphaned offerings
    if (orphanedOfferings.length > 0) {
      const ids = orphanedOfferings.map(o => o._id);
      await Offering.deleteMany({ _id: { $in: ids } });
      console.log(`🧹 Deleted ${ids.length} orphaned offerings`);
    }

    
    // Delete orphaned requests
    if (orphanedRequests.length > 0) {
      const ids = orphanedRequests.map(r => r._id);
      await Request.deleteMany({ _id: { $in: ids } });
      console.log(`🧹 Deleted ${ids.length} orphaned requests`);
    }

    // Same idea for orphaned vehicles
    const existingVehicleIds = (await User.find({ vehicleid: { $ne: null } }, 'vehicleid'))
      .map(u => u.vehicleid?.toString());

    const orphanedVehicles = await Vehicle.find({ _id: { $nin: existingVehicleIds } });
    if (orphanedVehicles.length > 0) {
      const ids = orphanedVehicles.map(v => v._id);
      await Vehicle.deleteMany({ _id: { $in: ids } });
      console.log(`🧹 Deleted ${ids.length} orphaned vehicles`);
    }

    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('❌ Error cleaning orphaned data:', error);
  }
};

cron.schedule('0 0 * * *', async () => {  // Runs at midnight every day
    console.log('Running cleanupOrphans...');
    try {
        const expiredUsers = await User.find({
            createdAt: { $lt: new Date(Date.now() - 4 * 365.25 * 24 * 60 * 60 * 1000) } //4 years ago
        });

        if (expiredUsers.length > 0) {
            for (const user of expiredUsers) {
                console.log(`Deleting expired user: ${user.uid}`);
                
                // Delete related vehicles
                await Vehicle.deleteMany({ _id: user.vehicleid });

                // Delete related offerings
                await Offering.deleteMany({ userid: user.uid });

                // Delete related requests
                await Request.deleteMany({ userid: user.uid });

                // Finally, delete the user
                await User.deleteOne({ _id: user._id });

                console.log(`Deleted user ${user.uid} and all related records.`);
            }
        } else {
            console.log('No expired users found.');
        }
    } catch (err) {
        console.error('Error during cleanup:', err);
    }
});

module.exports = cleanOrphanedData;

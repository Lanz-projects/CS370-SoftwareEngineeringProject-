// cron/rideReminderJob.js
const cron = require('node-cron');
const Offering = require('../models/Offering-schema');
const { onRideReminder } = require('../emailEvents');

// Runs daily at 8 AM
cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rides = await Offering.find({ arrivaldate: today });

  for (let ride of rides) {
    const allUids = [ride.userid, ...ride.acceptedUsers];
    await onRideReminder(ride, allUids);
  }

  console.log('📅 Ride reminder emails sent');
});

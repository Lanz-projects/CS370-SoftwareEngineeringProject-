const { sendToUser } = require('./emailSender');
const Offering = require('./models/Offering-schema');
const Request = require('./models/Request-schema');
const User = require('./models/User-schema');

async function onAccountCreated(uid) {
  await sendToUser(uid, 'Welcome to RideShare!', 'Thanks for signing up!');
}

async function onOfferCreated(uid) {
  await sendToUser(uid, 'Offer Created', 'Your ride offer was successfully posted.');
}

async function onRequestSubmitted(uid) {
  await sendToUser(uid, 'Request Submitted', 'Your ride request was submitted.');
}

async function onUserWantsToJoin(offerId, requesterUid) {
  const offer = await Offering.findById(offerId);
  const requester = await User.findOne({ uid: requesterUid });

  if (!offer || !requester) return;

  const displayName = requester.name || requester.email || 'Someone';

  await sendToUser(
    offer.userid,
    'Someone Wants to Join Your Ride',
    `${displayName} wants to join your ride offer.`
  );

  await sendToUser(
    requesterUid,
    'Request Sent',
    'Your request to join a ride has been sent successfully.'
  );
}

async function onRequestAccepted(offererUid, requesterUid) {
  await sendToUser(requesterUid, 'You Were Accepted!', 'The offerer has accepted your ride request.');
  await sendToUser(offererUid, 'You Accepted a Request', 'You accepted a rider into your offer.');
}

async function onOfferCancelled(offererUid, affectedUids = []) {
  await sendToUser(offererUid, 'Offer Cancelled', 'You cancelled your ride offer.');
  for (let uid of affectedUids) {
    await sendToUser(uid, 'Offer Cancelled', 'A ride you were a part of has been cancelled.');
  }
}

async function onRideRequestAccepted(posterUid, joinerUid) {
  await sendToUser(posterUid, 'Someone Joined Your Ride Request', 'A user has accepted your posted ride request.');
  await sendToUser(joinerUid, 'You Accepted a Ride Request', 'You accepted a ride request.');
}

async function onRideRequestDenied(posterUid, joinerUid) {
  await sendToUser(posterUid, 'Request Denied', 'Your ride request was denied.');
  await sendToUser(joinerUid, 'You Denied a Ride Request', 'You denied a ride request.');
}

async function onRideReminder(rideInfo, uids) {
  for (let uid of uids) {
    await sendToUser(
      uid,
      'Ride Reminder',
      `Reminder: You have a ride scheduled for ${rideInfo.arrivaldate} at ${rideInfo.arrivaltime}.`
    );
  }
}

async function onAccountDeleted(uid) {
  await sendToUser(uid, 'Account Deleted', 'Your RideShare account has been removed. We’re sorry to see you go!');
}

module.exports = {
  onAccountCreated,
  onOfferCreated,
  onRequestSubmitted,
  onUserWantsToJoin,
  onRequestAccepted,
  onOfferCancelled,
  onRideRequestAccepted,
  onRideRequestDenied,
  onRideReminder,
  onAccountDeleted,
};

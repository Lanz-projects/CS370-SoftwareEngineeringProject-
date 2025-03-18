const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  vehicleid: { 
    type: mongoose.Schema.Types.ObjectId, // Use MongoDB's ObjectId
    auto: true // Auto created by MongoDB
  },
  userid: { 
    type: String, 
    ref: 'User', 
    required: true 
  },
  color: {
    type: String,
    required: true
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  seatAmt: {
    type: Number,
    required: true,
    min: 1 
  }
}, { collection: 'Vehicles' });

module.exports = mongoose.model('Vehicle', VehicleSchema);

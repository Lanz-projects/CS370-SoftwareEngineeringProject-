const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offeringSchema = new Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'], // GeoJSON type must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    arrivaldate: {
        type: Date,
        required: true
    },
    vehicleid: {                              
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle', // Reference to the Vehicle collection
        required: true
    },
    notes: {
        type: String,
        required: true
    }
});

// Add a geospatial index for efficient querying
offeringSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Offering', offeringSchema);

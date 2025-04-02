const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offeringSchema = new Schema({
    userid: {
        type: String,
        ref: 'User',  // Foreign key reference to User schema
        required: true
    },
    name: {
        type: String,
        required: true
    },
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
        required: true
    },
    notes: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Add a geospatial index for efficient querying
offeringSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Offering', offeringSchema);

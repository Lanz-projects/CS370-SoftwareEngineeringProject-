const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
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
            enum: ['Point'], // Must be a GeoJSON Point
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
    notes: {
        type: String,
        default: ""
    },
    wants: {
        type: String,
        default: "" // Section for additional "wants" notes
    },
    userAccepted: {
        type: String
    }
}, { timestamps: true });

// Add geospatial index for efficient location-based queries
requestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);
    
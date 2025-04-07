const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offeringSchema = new Schema({
    userid: {
        type: String,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function(coords) {
                    return coords.length === 2 && 
                           !isNaN(coords[0]) && 
                           !isNaN(coords[1]) &&
                           typeof coords[0] === 'number' &&
                           typeof coords[1] === 'number';
                },
                message: 'Coordinates must be an array of two valid numbers [longitude, latitude]'
            }
        },
        formattedAddress: String
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
        default: ""
    },
    maxSeats: {
        type: Number,
        required: true,
        min: 0 // Ensures maxSeats is at least 1
    },
    originalMaxSeats: {
        type: Number,
        required: true
    },
    waitingList: {
        type: [String], // Array of user IDs
        default: []
    },
    acceptedUsers: {
        type: [String], // Array of user IDs
        default: []
    },
    quickMessage: [{
        message: {
            type: String,
            required: true
        },
        userid: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Add geospatial index for location-based queries
offeringSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Offering', offeringSchema);
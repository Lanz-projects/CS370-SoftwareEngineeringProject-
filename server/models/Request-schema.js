const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
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
            required: true
        },
        formattedAddress: String // Add this line
    },
    arrivaldate: {
        type: Date,
        required: true
    },
    arrivaltime: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ""
    },
    wants: {
        type: String,
        default: ""
    },
    userAccepted: {
        type: String
    }
}, { timestamps: true });

requestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);
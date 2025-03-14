const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
}, {collection: 'Users' });

module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    emailNotifications: { type: Boolean, default: true },
    autoApproveLeave: { type: Boolean, default: false },
    companyLogoUrl: { type: String, default: '' },
    companyName: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Settings', settingsSchema);

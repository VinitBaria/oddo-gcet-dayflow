const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    companyName: { type: String, default: 'Dayflow Inc.' },
    workingHoursPerDay: { type: Number, default: 8 },
    overtimeMultiplier: { type: Number, default: 1.5 },
    defaultPaidLeave: { type: Number, default: 15 },
    defaultSickLeave: { type: Number, default: 10 },
    emailNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    autoApproveLeave: { type: Boolean, default: false },
    companyLogoUrl: { type: String, default: '' }
});

module.exports = mongoose.model('Settings', settingsSchema);

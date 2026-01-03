const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, ref: 'User' },
    userName: { type: String, required: true },
    type: { type: String, enum: ['paid', 'sick', 'unpaid'], required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    attachment: { type: String }, // URL to uploaded file
    createdAt: { type: String, required: true }
});

module.exports = mongoose.model('Leave', leaveSchema);

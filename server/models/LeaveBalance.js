const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User', unique: true },
    paid: { type: Number, default: 0 },
    sick: { type: Number, default: 0 },
    unpaid: { type: Number, default: 0 }
});

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, ref: 'User' },
    date: { type: String, required: true },
    checkIn: { type: String },
    checkOut: { type: String },
    workHours: { type: Number },
    extraHours: { type: Number },
    status: { type: String, enum: ['present', 'absent', 'on_leave'], required: true }
});

module.exports = mongoose.model('Attendance', attendanceSchema);

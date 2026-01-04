const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Ensure department names are unique PER COMPANY
departmentSchema.index({ name: 1, companyName: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);

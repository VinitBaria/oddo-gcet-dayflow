const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const LeaveBalance = require('./models/LeaveBalance');
const Department = require('./models/Department');
const Settings = require('./models/Settings');
const Counter = require('./models/Counter');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dayflow-hr';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        clearData();
    })
    .catch((err) => console.error(err));

async function clearData() {
    try {
        console.log('Clearing all data...');
        // Clear all collections
        await User.deleteMany({});
        await Attendance.deleteMany({});
        await Leave.deleteMany({});
        await LeaveBalance.deleteMany({});
        await Department.deleteMany({});
        await Settings.deleteMany({});
        await Counter.deleteMany({}); // Reset ID counters too

        // Add default departments
        console.log('Adding default departments...');
        const defaultDepartments = [
            'Management',
            'Human Resources',
            'Engineering',
            'Marketing',
            'Sales',
            'Finance',
            'Operations',
            'Customer Support',
            'IT',
            'Legal',
            'Research & Development',
            'Quality Assurance'
        ];

        for (const deptName of defaultDepartments) {
            const dept = new Department({ name: deptName });
            await dept.save();
        }

        console.log('Database cleared and seeded successfully.');
        console.log('You can now Sign Up as a new Admin.');
        process.exit();
    } catch (err) {
        console.error('Error clearing data:', err);
        process.exit(1);
    }
}

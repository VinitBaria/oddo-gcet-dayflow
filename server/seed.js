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
        console.log('Connection String Host:', MONGODB_URI.split('@')[1] || 'localhost (or no auth)');
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

        // We will create departments for the default "Dayflow HR" company
        for (const deptName of defaultDepartments) {
            const dept = new Department({ name: deptName, companyName: 'Dayflow HR' });
            await dept.save();
        }

        // Add dummy employees
        console.log('Adding dummy employees...');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const employees = [
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@dayflow.com',
                password: hashedPassword,
                role: 'admin',
                department: 'Management',
                jobTitle: 'Administrator',
                status: 'present',
                joinDate: '2023-01-01',
                employeeId: 'ADMIN001',
                id: '1001',
                companyName: 'Dayflow HR',
                avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
            },
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@dayflow.com',
                password: hashedPassword,
                role: 'employee',
                department: 'Engineering',
                jobTitle: 'Software Engineer',
                status: 'present',
                joinDate: '2023-02-15',
                employeeId: 'EMP001',
                id: '1002',
                companyName: 'Dayflow HR',
                avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@dayflow.com',
                password: hashedPassword,
                role: 'hr',
                department: 'Human Resources',
                jobTitle: 'HR Manager',
                status: 'present',
                joinDate: '2023-03-10',
                employeeId: 'HR001',
                id: '1003',
                companyName: 'Dayflow HR',
                avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
            }
        ];

        for (const empData of employees) {
            const user = new User(empData);
            const savedUser = await user.save();

            // Initialize leave balance
            const leaveBalance = new LeaveBalance({
                userId: savedUser.id,
                paid: 15,
                sick: 10,
                unpaid: 10,
                companyName: 'Dayflow HR'
            });
            await leaveBalance.save();
        }

        // Settings for seed company
        const defaultSettings = new Settings({
            companyName: 'Dayflow HR',
        });
        await defaultSettings.save();

        console.log('Database cleared and seeded successfully.');
        console.log('You can now Sign Up as a new Admin.');
        process.exit();
    } catch (err) {
        console.error('Error clearing data:', err);
        process.exit(1);
    }
}

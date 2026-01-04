const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const Department = require('../models/Department');
const Settings = require('../models/Settings');
const { generateLoginId } = require('../utils/idGenerator');
const { generatePassword } = require('../utils/passwordGenerator');
const { sendCredentials } = require('../utils/emailService');
const upload = require('../utils/upload');
const authenticate = require('../middleware/auth');

// --- Employees ---

// Get all employees
// Get all employees (for THIS company)
router.get('/employees', authenticate, async (req, res) => {
    try {
        const employees = await User.find({ companyName: req.user.companyName });
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get employee by ID
// Get employee by ID (ensure in same company)
router.get('/employees/:id', authenticate, async (req, res) => {
    try {
        const employee = await User.findOne({ id: req.params.id, companyName: req.user.companyName });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create employee
// Create employee
router.post('/employees', authenticate, async (req, res) => {
    try {
        const { firstName, lastName, email, joinDate, companyName } = req.body;

        console.log('Creating employee:', { firstName, lastName, email, role: req.body.role }); // Log attempt

        // Auto-generate credentials
        // Fallback to 'Dayflow' if no company name provided (though it should be)
        const loginId = await generateLoginId(companyName || 'Dayflow', firstName, lastName, joinDate);
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            ...req.body,
            id: Date.now().toString(), // Helper ID, different from employeeId
            employeeId: loginId,
            password: hashedPassword,
            status: 'present', // Default status
            companyName: req.user.companyName // Enforce Creator's Company
        });

        const newUser = await user.save();
        console.log('Employee created successfully:', { loginId, role: newUser.role }); // Log success

        // Initialize leave balance for new user
        const leaveBalance = new LeaveBalance({ userId: newUser.id, paid: 15, sick: 10, unpaid: 10, companyName: req.user.companyName });
        await leaveBalance.save();

        // Send credentials
        console.log(`Sending credentials to: ${email}`);
        const emailResult = await sendCredentials(email, loginId, password, firstName);
        console.log(`Email send result: ${emailResult}`);

        res.status(201).json(newUser);
    } catch (err) {
        console.error('Employee creation error:', err); // Detailed logging
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
        }
        res.status(500).json({ message: err.message });
    }
});


// Update employee
router.put('/employees/:id', authenticate, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
    try {
        const employee = await User.findOne({ id: req.params.id, companyName: req.user.companyName });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Handle file uploads
        if (req.files) {
            if (req.files['avatar']) {
                // Cloudinary returns the full URL in `path`
                req.body.avatar = req.files['avatar'][0].path;
            }
            if (req.files['banner']) {
                req.body.bannerUrl = req.files['banner'][0].path;
            }
        }

        // Parse nested JSON strings (common with FormData)
        ['bankDetails', 'salaryInfo', 'personalInfo'].forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                try {
                    req.body[field] = JSON.parse(req.body[field]);
                } catch (e) {
                    console.error(`Error parsing ${field}:`, e);
                }
            }
        });

        Object.assign(employee, req.body);
        const updatedUser = await employee.save();
        res.json(updatedUser);
    } catch (err) {
        console.error('Update error:', err);
        res.status(400).json({ message: err.message });
    }
});

// Delete employee
router.delete('/employees/:id', authenticate, async (req, res) => {
    try {
        const employee = await User.findOne({ id: req.params.id, companyName: req.user.companyName });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Delete related data (optional but good for cleanup)
        await LeaveBalance.deleteOne({ userId: req.params.id });
        // Optionally delete leave requests and attendance if strict cleanup is needed
        // await Leave.deleteMany({ userId: req.params.id });
        // await Attendance.deleteMany({ userId: req.params.id });

        await User.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Certificate
router.post('/employees/:id/certificates', authenticate, upload.single('certificate'), async (req, res) => {
    try {
        const employee = await User.findOne({ id: req.params.id, companyName: req.user.companyName });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const fileUrl = req.file.path;

        employee.certificates.push({
            name: req.body.name || req.file.originalname,
            fileUrl: fileUrl,
            uploadDate: new Date()
        });

        await employee.save();
        res.json(employee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- Attendance ---

// Get attendance records
router.get('/attendance', authenticate, async (req, res) => {
    try {
        const attendance = await Attendance.find({ companyName: req.user.companyName });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check-in (Create)
router.post('/attendance', authenticate, async (req, res) => {
    const record = new Attendance({ ...req.body, companyName: req.user.companyName });
    try {
        const newRecord = await record.save();
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Check-out (Update)
router.put('/attendance/:id', authenticate, async (req, res) => {
    try {
        const record = await Attendance.findOne({ id: req.params.id, companyName: req.user.companyName });
        if (!record) return res.status(404).json({ message: 'Attendance record not found' });

        Object.assign(record, req.body);
        const updatedRecord = await record.save();
        res.json(updatedRecord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- Leaves ---

// Get all leave requests
router.get('/leaves', authenticate, async (req, res) => {
    try {
        const leaves = await Leave.find({ companyName: req.user.companyName });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create leave request
router.post('/leaves', authenticate, upload.single('attachment'), async (req, res) => {
    try {
        const leaveData = req.body;

        // Handle file upload
        if (req.file) {
            // Cloudinary URL
            leaveData.attachment = req.file.path;
        }

        const leave = new Leave({
            ...leaveData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            companyName: req.user.companyName
        });

        const newLeave = await leave.save();
        res.status(201).json(newLeave);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update leave request (approve/reject)
router.put('/leaves/:id', authenticate, async (req, res) => {
    try {
        // Only Admin (implied by accessing this, though we should check role ideally)
        const updatedLeave = await Leave.findOne({ id: req.params.id, companyName: req.user.companyName });
        if (!updatedLeave) return res.status(404).json({ message: 'Leave request not found' });

        updatedLeave.status = req.body.status;
        await updatedLeave.save();
        res.json(updatedLeave);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all leave balances
router.get('/leaves/balances', authenticate, async (req, res) => {
    try {
        const balances = await LeaveBalance.find({ companyName: req.user.companyName });
        res.json(balances);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get leave balance by User ID
router.get('/leaves/balance/:userId', authenticate, async (req, res) => {
    try {
        const balance = await LeaveBalance.findOne({ userId: req.params.userId, companyName: req.user.companyName });
        if (!balance) return res.status(404).json({ message: 'Balance not found' });
        res.json(balance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Departments ---

// Get all departments
router.get('/departments', authenticate, async (req, res) => {
    try {
        const departments = await Department.find({ companyName: req.user.companyName });
        res.json(departments.map(d => d.name));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add department
router.post('/departments', authenticate, async (req, res) => {
    const department = new Department({ name: req.body.name, companyName: req.user.companyName });
    try {
        const newDepartment = await department.save();
        res.status(201).json(newDepartment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete department
router.delete('/departments/:name', authenticate, async (req, res) => {
    try {
        await Department.findOneAndDelete({ name: req.params.name, companyName: req.user.companyName });
        res.json({ message: 'Department deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Settings ---

// Get settings
router.get('/settings', authenticate, async (req, res) => {
    try {
        let settings = await Settings.findOne({ companyName: req.user.companyName });
        if (!settings) {
            // Create default settings for this company if none exist
            settings = new Settings({ companyName: req.user.companyName });
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update settings
router.put('/settings', authenticate, upload.single('companyLogo'), async (req, res) => {
    try {
        let settings = await Settings.findOne({ companyName: req.user.companyName });
        if (!settings) {
            settings = new Settings({ companyName: req.user.companyName });
        }

        // Handle file upload
        if (req.file) {
            settings.companyLogoUrl = req.file.path;
        }

        // Parse body if coming from formData (it might be flattened or just properties)
        // If we send other fields as form-data text fields, we update them.
        // Mongoose handles type coercion usually, but let's be safe.
        // Req.body will contain the text fields.
        Object.keys(req.body).forEach(key => {
            if (key !== 'companyLogo') {
                settings[key] = req.body[key];
            }
        });

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;


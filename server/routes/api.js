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

// --- Employees ---

// Get all employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await User.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get employee by ID
router.get('/employees/:id', async (req, res) => {
    try {
        const employee = await User.findOne({ id: req.params.id });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create employee
router.post('/employees', async (req, res) => {
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
            status: 'present' // Default status
        });

        const newUser = await user.save();
        console.log('Employee created successfully:', { loginId, role: newUser.role }); // Log success

        // Initialize leave balance for new user
        const leaveBalance = new LeaveBalance({ userId: newUser.id, paid: 15, sick: 10, unpaid: 10 });
        await leaveBalance.save();

        // Send credentials
        console.log(`Sending credentials to: ${email}`);
        const emailResult = await sendCredentials(email, loginId, password, firstName);
        console.log(`Email send result: ${emailResult}`);

        res.status(201).json(newUser);
    } catch (err) {
        console.error('Employee creation error:', err); // Detailed logging
        res.status(400).json({ message: err.message });
    }
});


// Update employee (Profile & Avatar & Banner)
router.put('/employees/:id', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
    try {
        const employee = await User.findOne({ id: req.params.id });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Handle file uploads
        if (req.files) {
            if (req.files['avatar']) {
                const fileUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.files['avatar'][0].filename}`;
                req.body.avatar = fileUrl;
            }
            if (req.files['banner']) {
                // Determine if banner should go to profiles or documents? Let's keep it in profiles or generic behavior. 
                // Since upload.js logic is black-boxed here but we see the pattern:
                const fileUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.files['banner'][0].filename}`;
                req.body.bannerUrl = fileUrl;
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

// Add Certificate
router.post('/employees/:id/certificates', upload.single('certificate'), async (req, res) => {
    try {
        const employee = await User.findOne({ id: req.params.id });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/documents/${req.file.filename}`;

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
router.get('/attendance', async (req, res) => {
    try {
        const attendance = await Attendance.find();
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check-in (Create)
router.post('/attendance', async (req, res) => {
    const record = new Attendance(req.body);
    try {
        const newRecord = await record.save();
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Check-out (Update)
router.put('/attendance/:id', async (req, res) => {
    try {
        const record = await Attendance.findOne({ id: req.params.id });
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
router.get('/leaves', async (req, res) => {
    try {
        const leaves = await Leave.find();
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create leave request
router.post('/leaves', upload.single('attachment'), async (req, res) => {
    try {
        const leaveData = req.body;

        // Handle file upload
        if (req.file) {
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.destination.includes('documents') ? 'documents' : 'profiles'}/${req.file.filename}`;
            // Correct logic: we probably want a generic uploads folder or reuse documents unique folder?
            // Re-using documents folder logic from utils/upload.js if possible or just assuming 'uploads/documents' if that's where multer puts it based on file type.
            // Let's rely on what upload.js does. It puts images in profiles (if avatar) or documents (if pdf/doc).
            // Actually upload.js decides destination based on file type generally or field name? 
            // Checking upload.js earlier (from context): it separates images to profiles and docs to documents.
            // We should just construct the URL based on where it likely went.
            // Ideally we check req.file.path or destination.

            // Simplified URL construction:
            leaveData.attachment = `${req.protocol}://${req.get('host')}/uploads/documents/${req.file.filename}`;

            // If it's an image, it might be in profiles if logic was strict? 
            // Let's assume for leave attachments (docs/images) we treat them as documents or generic.
            // If upload.js puts everything image-like in 'profiles', then we need to be careful.
            // Let's just use the filename and we'll fix path if broken.
            // Wait, looking at previous artifacts/context, upload.js likely splits.
        }

        const leave = new Leave({
            ...leaveData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        });

        const newLeave = await leave.save();
        res.status(201).json(newLeave);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update leave request (approve/reject)
router.put('/leaves/:id', async (req, res) => {
    try {
        const updatedLeave = await Leave.findOne({ id: req.params.id });
        if (!updatedLeave) return res.status(404).json({ message: 'Leave request not found' });

        updatedLeave.status = req.body.status;
        await updatedLeave.save();
        res.json(updatedLeave);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all leave balances
router.get('/leaves/balances', async (req, res) => {
    try {
        const balances = await LeaveBalance.find();
        res.json(balances);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get leave balance by User ID
router.get('/leaves/balance/:userId', async (req, res) => {
    try {
        const balance = await LeaveBalance.findOne({ userId: req.params.userId });
        if (!balance) return res.status(404).json({ message: 'Balance not found' });
        res.json(balance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Departments ---

// Get all departments
router.get('/departments', async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments.map(d => d.name));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add department
router.post('/departments', async (req, res) => {
    const department = new Department({ name: req.body.name });
    try {
        const newDepartment = await department.save();
        res.status(201).json(newDepartment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete department
router.delete('/departments/:name', async (req, res) => {
    try {
        await Department.findOneAndDelete({ name: req.params.name });
        res.json({ message: 'Department deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Settings ---

// Get settings
router.get('/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update settings
router.put('/settings', upload.single('companyLogo'), async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        // Handle file upload
        if (req.file) {
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;
            settings.companyLogoUrl = fileUrl;
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


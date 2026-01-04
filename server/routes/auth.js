const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateLoginId } = require('../utils/idGenerator');
const { sendCredentials } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Signup (Admin/HR)
router.post('/signup', async (req, res) => {
    try {
        const { companyName, firstName, lastName, email, phone, password, confirmPassword, logoUrl } = req.body;

        console.log('Signup attempt:', { companyName, email, phone }); // Log attempt

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate Login ID
        const joinDate = new Date();
        const loginId = await generateLoginId(companyName, firstName, lastName, joinDate);

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            id: Date.now().toString(), // Helper ID for generic use
            employeeId: loginId,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'admin', // First user is Admin
            jobTitle: 'Administrator', // Default
            department: 'Management', // Default
            companyName,
            logoUrl, // Save logo URL (Base64 or link)
            phone,
            joinDate: joinDate.toISOString().split('T')[0],
            status: 'present'
        });

        await newUser.save();

        // Send Welcome Email
        console.log(`Attempting to send welcome email to: ${email}`);
        const emailResult = await sendCredentials(email, loginId, password, firstName);
        console.log(`Email send result: ${emailResult}`);

        res.status(201).json({ message: 'User registered successfully', loginId });
    } catch (err) {
        console.error('Signup Error:', err); // Detailed logging
        res.status(500).json({ message: err.message || 'Server error during registration' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { loginId, password } = req.body;

        // Allow login with Email or Login ID
        const user = await User.findOne({
            $or: [{ email: loginId }, { employeeId: loginId }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user.id,
                employeeId: user.employeeId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                companyName: user.companyName
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify Token
router.get('/verify', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ id: decoded.id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                employeeId: user.employeeId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                companyName: user.companyName
            }
        });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;

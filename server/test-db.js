const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkConnection() {
    console.log('--- Database Verification Tool ---');
    console.log('Connecting to:', MONGODB_URI);

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connection Successful!');

        const count = await User.countDocuments();
        console.log(`✅ Users found in database: ${count}`);

        const users = await User.find({}, 'email companyName');
        console.log('--- User List ---');
        users.forEach(u => console.log(`- ${u.email} (${u.companyName})`));

        console.log('----------------------------------');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    }
}

checkConnection();

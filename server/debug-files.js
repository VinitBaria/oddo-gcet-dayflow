const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Leave = require('./models/Leave');

const checkFiles = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dayflow-hr';
    console.log('Connecting to DB...');
    try {
        await mongoose.connect(uri);
        console.log('Connected.');

        console.log('\n--- LEAVE ATTACHMENTS ---');
        const leaves = await Leave.find({ attachment: { $exists: true, $ne: null } });
        leaves.forEach(l => {
            if (l.attachment) console.log(`[${l.createdAt}] Leave ${l.id} (${l.type}): ${l.attachment}`);
        });

        console.log('\n--- USER CERTIFICATES ---');
        const users = await User.find({ 'certificates.0': { $exists: true } });
        users.forEach(u => {
            u.certificates.forEach(c => {
                console.log(`[${c.uploadDate}] User ${u.firstName} - Cert "${c.name}": ${c.fileUrl}`);
            });
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkFiles();

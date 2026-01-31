const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Leave = require('./models/Leave');

const checkFiles = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dayflow-hr';
    try {
        await mongoose.connect(uri);

        const leaves = await Leave.find({ attachment: { $exists: true, $ne: null } }).sort({ createdAt: -1 }).limit(5);

        console.log("LEAVES_START");
        leaves.forEach(l => {
            if (l.attachment) console.log(`ID:${l.id} URL:${l.attachment}`);
        });
        console.log("LEAVES_END");

        console.log("CERTS_START");
        const users = await User.find({ 'certificates.0': { $exists: true } });
        users.forEach(u => {
            u.certificates.forEach(c => {
                console.log(`USER:${u.firstName} URL:${c.fileUrl}`);
            });
        });
        console.log("CERTS_END");

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkFiles();

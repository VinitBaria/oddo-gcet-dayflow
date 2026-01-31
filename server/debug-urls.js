const fs = require('fs');
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
        const users = await User.find({ 'certificates.0': { $exists: true } });
        const usersWithAvatar = await User.find({ avatar: { $exists: true } }).limit(5);

        let output = "LEAVES:\n";
        leaves.forEach(l => {
            if (l.attachment) output += `${l.attachment}\n`;
        });

        output += "\nCERTIFICATES:\n";
        users.forEach(u => {
            u.certificates.forEach(c => {
                output += `${c.fileUrl}\n`;
            });
        });

        output += "\nAVATARS:\n";
        usersWithAvatar.forEach(u => {
            if (u.avatar) output += `${u.avatar}\n`;
        });

        fs.writeFileSync('urls.txt', output);
        console.log("Written to urls.txt");

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkFiles();

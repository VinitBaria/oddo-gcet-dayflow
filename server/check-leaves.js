const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Leave = require('./models/Leave');

const checkLeaves = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dayflow-hr';
    try {
        await mongoose.connect(uri);
        const leaves = await Leave.find({});
        leaves.forEach(l => {
            if (l.attachment) {
                console.log("URL_START " + l.attachment + " URL_END");
            }
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkLeaves();

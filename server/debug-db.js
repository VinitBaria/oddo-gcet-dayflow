const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

const checkDb = async (uri, name) => {
    if (!uri) return;
    console.log(`\n--- Checking ${name} DB ---`);
    console.log(`URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`); // Mask password
    try {
        await mongoose.connect(uri);
        console.log(`Connected to ${name}`);
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        let foundCerts = false;
        users.forEach(u => {
            if (u.certificates && u.certificates.length > 0) {
                foundCerts = true;
                console.log(`User: ${u.firstName} (${u.email}) has ${u.certificates.length} certs.`);
                u.certificates.forEach(c => console.log(`   -> ${c.fileUrl}`));
            }
        });
        if (!foundCerts) console.log('No certificates found in this DB.');

        await mongoose.disconnect();
    } catch (err) {
        console.log(`Failed to connect to ${name}: ${err.message}`);
    }
};

(async () => {
    const envUri = process.env.MONGODB_URI;
    const localUri = 'mongodb://localhost:27017/dayflow-hr';

    await checkDb(envUri, 'ENV_URI');

    if (envUri !== localUri) {
        await checkDb(localUri, 'LOCALHOST');
    }
})();

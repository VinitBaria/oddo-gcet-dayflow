require('dotenv').config();
const nodemailer = require('nodemailer');

async function diagnose() {
    console.log('--- Diagnostics ---');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);

    const pass = process.env.SMTP_PASS || '';
    console.log('SMTP_PASS length:', pass.length);
    console.log('SMTP_PASS first char:', pass[0]);
    console.log('SMTP_PASS last char:', pass[pass.length - 1]);
    console.log('SMTP_PASS contains spaces:', pass.includes(' '));

    if (pass.length !== 16) {
        console.log('WARNING: App Password should typically be 16 characters long.');
    }
    if (pass.includes(' ')) {
        console.log('WARNING: App Password contains spaces. It should be the 16-character string without spaces.');
    }

    console.log('\n--- Attempting Connection (Port 587, secure: false) ---');
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: pass.replace(/\s+/g, '') // Try removing spaces automatically
            }
        });
        await transporter.verify();
        console.log('SUCCESS: Connection verified with Port 587!');
    } catch (err) {
        console.error('FAILURE (Port 587):', err.message);
        if (err.response) console.error('Response:', err.response);
    }

    console.log('\n--- Attempting Connection (Port 465, secure: true) ---');
    try {
        const transporterSecure = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: pass.replace(/\s+/g, '')
            }
        });
        await transporterSecure.verify();
        console.log('SUCCESS: Connection verified with Port 465!');
    } catch (err) {
        console.error('FAILURE (Port 465):', err.message);
    }
}

diagnose();

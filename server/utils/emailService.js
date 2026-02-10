const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
});

async function sendEmail(to, subject, text) {
    try {
        // Check if credentials are set
        if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
            console.log('================================================================');
            console.log(`[MOCK EMAIL SERVICE] (Configure .env to send real emails)`);
            console.log(`TO: ${to}`);
            console.log(`SUBJECT: ${subject}`);
            console.log(`BODY:`);
            console.log(text);
            console.log('================================================================');
            return true;
        }

        const info = await transporter.sendMail({
            from: `"Dayflow HR" <${process.env.SMTP_USER}>`, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
        });

        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

async function sendCredentials(email, loginId, password, name) {
    const subject = 'Welcome to Dayflow HR - Your Login Credentials';
    const body = `Dear ${name},

Welcome to Dayflow HR! Your account has been created.

Here are your login credentials:
Login ID: ${loginId}
Password: ${password}

Please request a password change upon your first login.

Best regards,
Dayflow HR Team`;

    return sendEmail(email, subject, body);
}

module.exports = { sendEmail, sendCredentials };

const { sendEmail } = require('./utils/emailService');
require('dotenv').config();

async function test() {
    console.log('Attempting to send test email to:', process.env.SMTP_USER);
    // Send to the sender's own email to avoid spamming others/errors if TO is empty
    const to = process.env.SMTP_USER;
    if (!to) {
        console.error('Error: SMTP_USER is not defined in .env');
        return;
    }

    const result = await sendEmail(to, 'Test Email from Dayflow HR', 'This is a test email to verify that your SMTP settings and App Password are working correctly.');

    if (result) {
        console.log('SUCCESS: Test email sent successfully!');
    } else {
        console.error('FAILURE: Failed to send test email.');
    }
}

test();

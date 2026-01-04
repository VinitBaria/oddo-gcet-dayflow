const crypto = require('crypto');

function generatePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
        const randomIndex = randomBytes[i] % charset.length;
        password += charset[randomIndex];
    }
    return password;
}

module.exports = { generatePassword };

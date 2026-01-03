const Counter = require('../models/Counter');

async function generateLoginId(companyName, firstName, lastName, joinDate) {
    const year = new Date(joinDate).getFullYear();

    // Extract parts
    const companyCode = companyName.substring(0, 2).toUpperCase();
    const nameCode = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();

    // Get and increment serial for the year
    const counter = await Counter.findOneAndUpdate(
        { _id: 'employeeId', year: year },
        { $inc: { seq: 1 } },
        { new: true, upsert: true } // Create if doesn't exist
    );

    const serial = counter.seq.toString().padStart(4, '0');

    return `${companyCode}${nameCode}${year}${serial}`;
}

module.exports = { generateLoginId };

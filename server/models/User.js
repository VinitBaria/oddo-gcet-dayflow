const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true, unique: true }, // This is the Login ID (e.g., OIJODO20220001)
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee', 'hr'], default: 'employee' },
    jobTitle: { type: String, required: true },
    department: { type: String, required: true },
    companyName: { type: String }, // For Admin/HR
    logoUrl: { type: String }, // For Admin/HR
    avatar: { type: String },
    bannerUrl: { type: String },
    phone: { type: String },
    joinDate: { type: String, required: true },
    status: { type: String, enum: ['present', 'absent', 'on_leave'], default: 'present' },

    // Personal Info
    personalInfo: {
        dob: { type: Date },
        address: { type: String },
        nationality: { type: String },
        personalEmail: { type: String },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
    },

    // Bank Details
    bankDetails: {
        accountNumber: { type: String },
        bankName: { type: String },
        ifscCode: { type: String },
        panNo: { type: String },
        uanNo: { type: String },
    },

    // Salary Info
    salaryInfo: {
        wageType: { type: String, enum: ['monthly', 'hourly'], default: 'monthly' }, // Monthly or Hourly
        monthlyWage: { type: Number, default: 0 },
        basicSalary: { type: Number, default: 0 },
        hra: { type: Number, default: 0 },
        standardAllowance: { type: Number, default: 0 },
        performanceBonus: { type: Number, default: 0 },
        leaveTravelAllowance: { type: Number, default: 0 },
        fixedAllowance: { type: Number, default: 0 },
        pfEmployee: { type: Number, default: 0 },
        pfEmployer: { type: Number, default: 0 },
        professionalTax: { type: Number, default: 0 },
    },

    // Certifications
    certificates: [{
        name: { type: String },
        fileUrl: { type: String },
        uploadDate: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('User', userSchema);

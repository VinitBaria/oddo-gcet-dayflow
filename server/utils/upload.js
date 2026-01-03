const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/others';

        if (file.fieldname === 'avatar' || file.fieldname === 'companyLogo' || file.fieldname === 'banner') {
            uploadPath = 'uploads/profiles';
        } else if (file.fieldname === 'certificate' || file.fieldname === 'attachment') {
            uploadPath = 'uploads/documents';
        }

        // Create full path relative to server root
        const fullPath = path.join(__dirname, '..', uploadPath);
        createDir(fullPath);

        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'avatar' || file.fieldname === 'companyLogo' || file.fieldname === 'banner') {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
    }
    // Allow PDFs and Images for certificates and leave attachments
    if (file.fieldname === 'certificate' || file.fieldname === 'attachment') {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/)) {
            return cb(new Error('Only image and document files are allowed!'), false);
        }
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;

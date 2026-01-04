const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folderName = 'dayflow-hr/others';

        if (file.fieldname === 'avatar' || file.fieldname === 'companyLogo' || file.fieldname === 'banner') {
            folderName = 'dayflow-hr/profiles';
        } else if (file.fieldname === 'certificate' || file.fieldname === 'attachment') {
            folderName = 'dayflow-hr/documents';
        }

        return {
            folder: folderName,
            resource_type: 'auto', // Allow images and raw files (like PDFs treated properly if needed, although auto usually detects)
            public_id: file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9),
        };
    },
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

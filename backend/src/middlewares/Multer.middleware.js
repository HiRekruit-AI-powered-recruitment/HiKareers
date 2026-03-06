import multer from 'multer';
import ApiError from '../utils/ApiError.utils.js';

// Allowed resume MIME types: PDF, DOC, DOCX
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

// File filter for resume validation
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only PDF, DOC, or DOCX files are allowed for resume upload'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

export const uploadResume = upload.single('resume');

// Error handler for multer
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(400, 'File size exceeds 5MB limit'));
        }
        return next(new ApiError(400, err.message));
    }
    next(err);
};

export { ALLOWED_EXTENSIONS };

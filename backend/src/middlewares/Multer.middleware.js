import multer from 'multer';
import ApiError from '../utils/ApiError.utils.js';

// File filter for PDF only
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only PDF files are allowed'), false);
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


// MemoryStorage v/s diskStorage:
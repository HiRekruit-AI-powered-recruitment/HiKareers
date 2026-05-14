import multer from 'multer';
import ApiError from '../utils/ApiError.utils.js';

// ================= RESUME CONFIG =================

// Allowed resume MIME types: PDF, DOC, DOCX
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

// File filter for resume validation
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'Only PDF, DOC, or DOCX files are allowed for resume upload'
      ),
      false
    );
  }
};

// Resume upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

export const uploadResume = upload.single('resume');

// ================= PROFILE PHOTO CONFIG =================

// Allowed image MIME types
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

// Image validation filter
const imageFilter = (req, file, cb) => {
  if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, 'Only JPG, JPEG, PNG, or WEBP images are allowed'),
      false
    );
  }
};

// Profile photo upload configuration
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
});

export const uploadProfilePhoto = imageUpload.single('profilePhoto');

// ================= MULTER ERROR HANDLER =================

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

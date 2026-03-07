import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';


const UploadToCloudinary = (fileBuffer, folderName, publicId, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',   // For documents (PDF, DOC, DOCX)
                folder: folderName,
                public_id: publicId,
                overwrite: true,
                ...options               // Allow caller to pass format or other options
            },
            (error, result) => {
                if (error) return reject(error);
                return resolve(result);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
}

export default UploadToCloudinary;

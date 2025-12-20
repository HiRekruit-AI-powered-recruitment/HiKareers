import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';


const UploadToCloudinary = (fileBuffer, jobId, userId) => {
    const publicId = `${userId}`;
    const folder = `resumes/${jobId}`;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',   // For PDF files
                folder: folder,
                public_id: publicId,
                overwrite: true
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
}

export default UploadToCloudinary;
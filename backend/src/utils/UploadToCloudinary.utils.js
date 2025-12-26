import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';


const UploadToCloudinary = (fileBuffer, folderName, publicId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',   // For PDF files
                folder: folderName,
                public_id: publicId,
                format: "pdf",
                overwrite: true
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
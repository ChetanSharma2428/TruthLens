import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

let isCloudinaryConfigured = false;

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  });
  isCloudinaryConfigured = true;
}

// Uploads an image buffer to Cloudinary or falls back to a base64 data URI
export async function uploadImageBuffer(buffer, mimetype = 'image/jpeg') {
  if (!isCloudinaryConfigured) {
    // Graceful fallback: return data URI when Cloudinary is not configured
    return `data:${mimetype};base64,${buffer.toString('base64')}`;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'truthlens/screenshots',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.warn('[Cloudinary Error] Fallback to buffer:', error.message);
          return resolve(`data:${mimetype};base64,${buffer.toString('base64')}`);
        }
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

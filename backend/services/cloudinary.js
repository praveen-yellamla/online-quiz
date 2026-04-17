const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadImage = async (base64Image, folder) => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `crestonix_quiz/${folder}`,
      resource_type: 'image'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return null;
  }
};

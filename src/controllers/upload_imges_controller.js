import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const storage = multer.memoryStorage();
export const uploadImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
}).array('images', 10);

// Upload handler using Axios
export const handleImageUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return res.status(500).json({ error: 'Cloudinary config missing' });
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const uploadPromises = req.files.map((file) => {
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);
      formData.append('upload_preset', uploadPreset);

      return axios.post(cloudinaryUrl, formData, {
        headers: formData.getHeaders(),
      }).then(response => response.data.secure_url);
    });

    const urls = await Promise.all(uploadPromises);

    return res.status(200).json({
      message: 'Images uploaded successfully',
      urls,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message || 'Upload failed',
    });
  }
};

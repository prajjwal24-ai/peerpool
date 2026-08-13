import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    // Explicit config inside handler to ensure key is ALWAYS present
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
      api_key: process.env.CLOUDINARY_API_KEY?.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    });

    console.log("Uploading to Cloudinary:", req.file.originalname);

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'peerpool_chats',
    });

    // Temp file clean up
    if (req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // ignore
      }
    }

    const isPdf = req.file.mimetype.includes('pdf');
    const isImage = req.file.mimetype.includes('image');

    return res.status(200).json({
      success: true,
      fileUrl: result.secure_url,
      fileType: isPdf ? 'pdf' : isImage ? 'image' : 'document',
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error('Cloudinary API Error:', error);

    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // ignore
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
});

export default router;
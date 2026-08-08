import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer temporary storage
const upload = multer({ dest: 'uploads/' });

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Cloudinary Upload (PDFs, Images, Docs)
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'peerpool_chats',
    });

    const fileType = req.file.mimetype.includes('pdf')
      ? 'pdf'
      : req.file.mimetype.includes('image')
      ? 'image'
      : 'document';

    res.status(200).json({
      success: true,
      fileUrl: result.secure_url,
      fileType,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'File upload failed' });
  }
});

export default router;
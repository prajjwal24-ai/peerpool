import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware.js';
import Message from '../models/Message.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 1. GET CHAT HISTORY FOR A GROUP (Messages Persistence Fix)
router.get('/:groupId', protect, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Fetch messages sorted by time and populate sender's name & email
    const messages = await Message.find({ group: groupId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Fetch Messages Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load messages',
    });
  }
});

// 2. FILE UPLOAD ROUTE (Cloudinary)
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

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
      } catch (e) {}
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
      } catch (e) {}
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
});

export default router;
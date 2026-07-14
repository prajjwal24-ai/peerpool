import express from 'express';
import { createPool, getAllPools } from '../controllers/poolController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/').post(protect, createPool)
                .get(getAllPools);

export default router
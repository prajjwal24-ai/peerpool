import express from 'express';
import { createPool, getAllPools, joinpool } from '../controllers/poolController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/').post(protect, createPool)
                .get(protect,getAllPools);

router.post('/:id/join', protect, joinpool);
export default router
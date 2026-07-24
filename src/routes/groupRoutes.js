import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { createGroup, getAllGroups, joinGroup, getGroupById } from '../controllers/groupController.js';

const router = express.Router();

router.get('/', protect, getAllGroups);
router.post('/create', protect, createGroup);
router.post('/:id/join', protect, joinGroup);
router.get('/:id', protect, getGroupById);

export default router;

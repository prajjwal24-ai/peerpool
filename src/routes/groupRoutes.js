import express from 'express';
import {protect} from '../middleware/authMiddleware.js';
import { createGroup, getAllGroups, joinGroup,respondToRequest, getGroupById, getGroupMessages} from '../controllers/groupController.js';

const router = express.Router();

router.get('/', protect, getAllGroups);
router.post('/create', protect, createGroup);
router.post('/:groupId/join', protect, joinGroup);
router.post('/:groupId/respond-request', protect, respondToRequest);
router.get('/:id', protect, getGroupById);
router.get('/:id/messages', protect, getGroupMessages);

export default router;

import express from 'express';
import { protect, verifyToken } from '../middleware/authMiddleware.js';
import { 
  createGroup, 
  getAllGroups, 
  joinGroup, 
  respondToRequest, 
  getGroupById, 
  getGroupMessages,
  leaveGroup
} from '../controllers/groupController.js';

const router = express.Router();

// Base routes
router.get('/', protect, getAllGroups);
router.post('/create', protect, createGroup);

// Dynamic routes (Actions)
router.post('/:groupId/join', protect, joinGroup);
router.post('/:groupId/respond-request', protect, respondToRequest);

// Dynamic routes (Fetch Data)
router.get('/:id', protect, getGroupById);
router.get('/:id/messages', protect, getGroupMessages);
router.put('/:groupId/leave',verifyToken ,leaveGroup);

export default router;
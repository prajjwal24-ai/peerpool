import express from 'express';
import { createResource, getPoolResources } from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/',protect, createResource);

router.get('/:poolId',protect, getPoolResources);

export default router;
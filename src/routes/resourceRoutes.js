import express from 'express';
import { createResource, getPoolResources } from '../controllers/resourceController.js';

const router = express.Router();

router.post('/', createResource);

router.get('/:poolId', getPoolResources);

export default router;
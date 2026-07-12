import express from 'express';
import { createPool, getAllPools } from '../controllers/poolController.js';

const router = express.Router();
router.route('/').post(createPool)
                .get(getAllPools);

export default router
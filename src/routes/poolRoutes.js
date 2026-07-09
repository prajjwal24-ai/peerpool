import express from 'express';
import { createPool, getAllPools } from '../controllers/poolController';

const router = express.Router();
router.route('/').post(createpool)
                .get(getAllPools);

export default router
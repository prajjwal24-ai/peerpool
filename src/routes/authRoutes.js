import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register sign up ke liye 
router.post('/register', registerUser);

router.post('/login', loginUser);
export default router;
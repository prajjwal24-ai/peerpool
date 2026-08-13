import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'node:http';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import connectDB from './config/db.js';
import poolRoutes from './routes/poolRoutes.js';
import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import { initSocket } from './sockets/index.js';
import chatRoutes from './routes/chatRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

// Initialize Socket.io
const io = initSocket(httpServer);
app.set('io', io); // Attach io to app so controllers can use req.app.get('io')

// Routes
app.use('/api/pools', poolRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.json({ success: true, message: 'PeerPool API is running smoothly!' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});
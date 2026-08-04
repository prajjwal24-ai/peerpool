import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'node:http';
import connectDB from './config/db.js';
import poolRoutes from './routes/poolRoutes.js';
import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import { initSocket } from './sockets/index.js';

dotenv.config(); 
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);


const io = initSocket(httpServer);


app.use('/api/pools', poolRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);

app.get('/', (req, res) => {
    res.json({ success: true, message: 'PeerPool API is running smoothly!' });
});

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
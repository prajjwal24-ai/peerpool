import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { registerChatHandlers } from './chatHandler.js'; 

const allowedOrigins = [
    "http://localhost:5173",
    "https://peerpool-sand.vercel.app",
    "https://peerpool-6mi4zauvl-prajjwal-katiyars-projects.vercel.app"
];

export const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // JWT Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }
        try {
            const secret = process.env.JWT_SECRET || 'peerpool_secret_123';
            const decoded = jwt.verify(token, secret);
            socket.user = decoded; // Contains id, name, email
            next();
        } catch (err) {
            console.error("Socket auth failed:", err.message);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`⚡ Socket Connected: ${socket.id} (User: ${socket.user?.name || socket.user?.id})`);
        
        registerChatHandlers(io, socket);

        socket.on('disconnect', () => {
            console.log(`Socket Disconnected: ${socket.id}`);
        });
    });

    return io;
};
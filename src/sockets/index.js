import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { registerChatHandlers } from './chatHandler.js';

export const initSocket = (httpServer)=>{
    const io = new Server(httpServer , {
        cors : {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods : ['GET','POST'],
        }
    });

    io.use((socket, next)=>{
        const token = socket.handshake.auth?.token;
        if(!token){
            return next(new Error('Authentication error: Invalid token'));
        }
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
    });

    io.on('connnection',(socket)=>{
        console.log(`Socket Connected: ${socket.id} (User: ${socket.user.id})`)
        registerChatHandlers(io, socket);

        socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
    })
    return io;
};
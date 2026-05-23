import dotenv from "dotenv";
dotenv.config();

import { Server } from 'socket.io';
import { setupSocketHandlers } from './socket/socketHandler.js';
import { app } from './app.js';

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`WebSocket server running on port ${port} 🔥🔥`);
});

const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
});

io.on('connect_error', (error) => {
    console.error('Socket.IO connect error:', error);
});

try {
    setupSocketHandlers(io);
    console.log('Socket handlers set up successfully');
} catch (error) {
    console.error('Error setting up socket handlers:', error);
}
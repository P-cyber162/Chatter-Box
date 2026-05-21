import dotenv from "dotenv";
import { Server } from 'socket.io';
import { app } from './app.js';
import { setupSocketHandlers } from './socket/socketHandler.js';

dotenv.config();

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`WebSocket server running on port ${port} 🔥🔥`);
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
});

console.log('Setting up socket handlers...');

// Debug listeners
io.on('connection', (socket) => {
    console.log('DEBUG: Socket connected:', socket.id);
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
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
        origin: "*"
    }
});

setupSocketHandlers(io);
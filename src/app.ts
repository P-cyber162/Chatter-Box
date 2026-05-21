import express from 'express';
import type { Response } from 'express';
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import messageRoutes from "./routes/messageRoute.js";
import { errorHandler } from './middleware/errorHandler.middlewware.js';


const app = express();
app.use(express.json());

app.get('/health', (_req, res: Response) => {
    res.status(200).json({
        status: 'WebSocket server!',
        message: 'Chatter-Box is aktive🔥🔥'
    });
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/room', roomRoutes);
app.use('/api/v1/message', messageRoutes);

app.use(errorHandler);

export { app };
import express from 'express';
import type { Response } from 'express';
import { errorHandler } from './middleware/errorHandler.middlewware.js';


const app = express();
app.use(express.json());

app.get('/health', (_req, res: Response) => {
    res.status(200).json({
        status: 'WebSocket server!',
        message: 'Chatter-Box is aktive🔥🔥'
    });
});

app.use(errorHandler);

export { app };
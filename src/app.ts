import express from 'express';
import type { Response } from 'express';

const app = express();
app.use(express.json());

app.get('/health', (_req, res: Response) => {
    res.status(200).json({
        status: 'WebSocket server!',
        message: 'Chatter-Box is aktive🔥🔥'
    });
});

export { app };
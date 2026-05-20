import type{ Response} from "express";
import express from 'express';
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get('/health', (_req, res: Response) => {
    res.status(200).json({
        status: 'true',
        message: 'Chatter-Box is aktive🔥🔥'
    })
});

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Server running on port ${port} 🔥🔥`);
});
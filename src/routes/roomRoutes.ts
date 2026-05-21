import { Router } from 'express';
import { createRoom, joinRoom, leaveRoom } from '../controllers/roomController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/create-room', authenticateToken , createRoom);
router.get('/join-room', authenticateToken , joinRoom)
router.get('/leave-room', authenticateToken , leaveRoom);

export default router;
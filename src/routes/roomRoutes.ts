import { Router } from 'express';
import { createRoom, joinRoom, leaveRoom } from '../controllers/roomController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { catchAsync } from '../utils/catchAsync.js';

const router = Router();

router.post('/create-room', authenticateToken, catchAsync(createRoom));
router.post('/join-room', authenticateToken, catchAsync(joinRoom));
router.post('/leave-room', authenticateToken, catchAsync(leaveRoom));

export default router;
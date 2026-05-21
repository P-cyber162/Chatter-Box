import { Router } from 'express';
import { sendMessage, updateMessage, sendReaction, getMessages } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { catchAsync } from '../utils/catchAsync.js';

const router = Router();

router.post('/send-message', authenticateToken, catchAsync(sendMessage));
router.put('/update-message/:messageId', authenticateToken, catchAsync(updateMessage));
router.post('/send-reaction/:messageId', authenticateToken, catchAsync(sendReaction));
router.get('/history/:roomId', authenticateToken, catchAsync(getMessages));

export default router;
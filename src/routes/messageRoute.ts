import { Router } from 'express';
import { sendMessage, updateMessage, sendReaction } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/send-message', authenticateToken , sendMessage);
router.get('/update-message/:messageId', authenticateToken , updateMessage);
router.get('/send-reaction/:messageId', authenticateToken , sendReaction);


export default router;
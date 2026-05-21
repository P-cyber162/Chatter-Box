import { Router } from 'express';
import { createUser, getUser } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/createUser', createUser);
router.get('/getUser/:userId', authenticateToken, getUser);

export default router;
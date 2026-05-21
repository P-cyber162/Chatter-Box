import { Router } from 'express';
import { createUser, getUser } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { catchAsync } from '../utils/catchAsync.js';

const router = Router();

router.post('/createUser', catchAsync(createUser));
router.get('/getUser/:userId', authenticateToken, catchAsync(getUser));

export default router;
import { Router } from 'express';
import { createUser, loginUser, getCurrentUser } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

export const userRoutes = Router();

userRoutes.post('/register', createUser);
userRoutes.post('/login', loginUser);
userRoutes.get('/me', authenticateToken, getCurrentUser);
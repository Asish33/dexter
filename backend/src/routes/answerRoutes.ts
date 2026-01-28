import { Router } from 'express';
import { submitAnswer } from '../controllers/answerController';
import { authenticateToken } from '../middleware/auth';

export const answerRoutes = Router();

answerRoutes.post('/submit', authenticateToken, submitAnswer);
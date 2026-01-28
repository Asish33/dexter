import { Router } from 'express';
import { createQuiz, getAllQuizzes, getQuizById } from '../controllers/quizController';
import { authenticateToken } from '../middleware/auth';

export const quizRoutes = Router();

quizRoutes.post('/', authenticateToken, createQuiz);
quizRoutes.get('/', authenticateToken, getAllQuizzes);
quizRoutes.get('/:id', authenticateToken, getQuizById);
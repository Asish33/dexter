import { Router } from 'express';
import { createQuizWithAI, startMultiplayerQuizSession } from '../controllers/apiGatewayController';
import { authenticateToken } from '../middleware/auth';

export const apiGatewayRoutes = Router();

// Route for creating a quiz with AI-generated questions
apiGatewayRoutes.post('/create-quiz-with-ai', authenticateToken, createQuizWithAI);

// Route for starting a multiplayer quiz session
apiGatewayRoutes.post('/start-multiplayer-session', authenticateToken, startMultiplayerQuizSession);
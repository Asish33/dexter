import { Router } from 'express';
import { ingestData, generateQuestions } from '../controllers/graphRagController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Ingest data
router.post('/ingest', authenticateToken, ingestData);

// Generate questions
router.get('/generate/:graphId', authenticateToken, generateQuestions);

export const graphRagRoutes = router;

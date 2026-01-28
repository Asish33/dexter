import { Router } from 'express';
import { processDocument, uploadDocument } from '../controllers/apiGatewayController';
import { authenticateToken } from '../middleware/auth';

export const documentRoutes = Router();

documentRoutes.post('/process-document', authenticateToken, processDocument);
documentRoutes.post('/upload-document', authenticateToken, uploadDocument);
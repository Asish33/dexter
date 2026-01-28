// services/api/ai/aiService.ts
import { makeRequest } from '../utils/requestHandler';

// Using a different base URL for AI services
const AI_API_BASE_URL = process.env.REACT_APP_AI_API_BASE_URL || 'http://localhost:8000';

interface BatchRefineRequest {
  questions: any[];
  instruction: string;
}

interface BatchRefineResponse {
  questions: any[];
}

class AIService {
  async refineBatch(request: BatchRefineRequest): Promise<BatchRefineResponse> {
    // For AI services, we'll make a direct fetch call since it's on a different server
    const response = await fetch(`${AI_API_BASE_URL}/refine-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'AI service error' }));
      throw new Error(errorData.message || 'AI service error');
    }

    return await response.json();
  }
}

export const aiService = new AIService();
// services/api/gateway/gatewayService.ts
import { makeRequest } from '../utils/requestHandler';
import { Quiz } from '../../../types';

export interface CreateQuizWithAIParams {
  content: string;
  numQuestions: number;
  difficulty: string;
  title?: string;
  description?: string;
}

export interface StartMultiplayerSessionParams {
  quizId: number;
  maxPlayers: number;
}

class GatewayService {
  async createQuizWithAI(params: CreateQuizWithAIParams): Promise<any> {
    // Format the request to match backend expectations
    const requestBody = {
      title: params.title || 'AI Generated Quiz',
      description: params.description || '',
      document: {
        title: params.title || 'AI Generated Quiz',
        content: params.content
      },
      numQuestions: params.numQuestions,
      difficulty: params.difficulty
    };

    return makeRequest<any>('/gateway/create-quiz-with-ai', {
      method: 'POST',
      body: requestBody,
    });
  }

  async startMultiplayerSession(params: StartMultiplayerSessionParams): Promise<{ sessionId: string }> {
    return makeRequest<{ sessionId: string }>('/gateway/start-multiplayer-session', {
      method: 'POST',
      body: params,
    });
  }
}

export const gatewayService = new GatewayService();
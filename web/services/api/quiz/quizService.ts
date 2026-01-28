// services/api/quiz/quizService.ts
import { makeRequest } from '../utils/requestHandler';
import { Quiz, Question } from '../../../types';

export interface CreateQuizData {
  title: string;
  description?: string;
  questions: Partial<Question>[];
}

export interface QuizFilterOptions {
  limit?: number;
  offset?: number;
  isActive?: boolean;
}

class QuizService {
  async createQuiz(quizData: CreateQuizData): Promise<Quiz> {
    return makeRequest<Quiz>('/quizzes', {
      method: 'POST',
      body: quizData,
    });
  }

  async getAllQuizzes(options?: QuizFilterOptions): Promise<Quiz[]> {
    const params = new URLSearchParams();
    
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.isActive !== undefined) params.append('isActive', options.isActive.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/quizzes?${queryString}` : '/quizzes';
    
    return makeRequest<Quiz[]>(endpoint);
  }

  async getQuizById(id: number): Promise<Quiz> {
    return makeRequest<Quiz>(`/quizzes/${id}`);
  }

  async createQuizWithAI(
    title: string,
    content: string,
    numQuestions: number,
    difficulty: string,
    description?: string
  ): Promise<Quiz> {
    return makeRequest<Quiz>('/gateway/create-quiz-with-ai', {
      method: 'POST',
      body: {
        title,
        description: description || '',
        document: {
          title,
          content
        },
        numQuestions,
        difficulty
      },
    });
  }

  async startMultiplayerSession(quizId: number, maxPlayers: number): Promise<{ sessionId: string }> {
    return makeRequest<{ sessionId: string }>('/gateway/start-multiplayer-session', {
      method: 'POST',
      body: {
        quizId,
        maxPlayers
      },
    });
  }
}

export const quizService = new QuizService();
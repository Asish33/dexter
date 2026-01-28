// services/api/answer/answerService.ts
import { makeRequest } from '../utils/requestHandler';
import { Answer } from '../../../types';

export interface SubmitAnswerData {
  questionId: number;
  content: string;
  attemptId?: number;
}

class AnswerService {
  async submitAnswer(answerData: SubmitAnswerData): Promise<Answer> {
    return makeRequest<Answer>('/answers/submit', {
      method: 'POST',
      body: answerData,
    });
  }
}

export const answerService = new AnswerService();
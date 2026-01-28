import type { Quiz } from '../services/quizService';
import { RedisQuizService } from '../services/redisQuizService';

export interface Document {
  title: string;
  content: string;
}

export interface GeneratedQuestion {
  content: string;
  type: 'mcq' | 'tf' | 'short_answer';
  correctAnswer: string;
  options?: string[];
  points?: number;
}

export class APIGatewayService {
  /**
   * Process a document
   */
  static async processDocument(document: Document): Promise<void> {
    throw new Error('AI Service is currently disabled.');
  }

  /**
   * Generate questions from a document
   */
  static async generateQuestionsFromDocument(
    document: Document,
    numQuestions: number = 5
  ): Promise<GeneratedQuestion[]> {
    throw new Error('AI Service is currently disabled.');
  }

  /**
   * Evaluate an answer
   */
  static async evaluateAnswer(
    question: string,
    correctAnswer: string,
    userAnswer: string
  ): Promise<{ isCorrect: boolean; explanation?: string }> {
    throw new Error('AI Service is currently disabled.');
  }

  /**
   * Create a quiz with AI-generated questions
   */
  static async createQuizWithAI(
    title: string,
    description: string,
    userId: number,
    document: Document,
    numQuestions: number = 5
  ): Promise<Quiz> {
    throw new Error('AI Service is currently disabled.');
  }

  /**
   * Start a multiplayer quiz session with real-time capabilities
   */
  static async startMultiplayerQuizSession(
    quizId: number,
    hostUserId: string,
    maxPlayers: number = 10
  ): Promise<string> {
    // Generate a unique session ID
    const sessionId = `quiz_${quizId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize the quiz session in Redis
    await RedisQuizService.createQuizSession(sessionId, quizId, hostUserId);

    return sessionId;
  }
}
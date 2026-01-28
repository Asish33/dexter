import { db } from '../db';
import { quizzes, questions, quizAttempts, answers } from '../db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { AIWorkerService } from './aiWorkerService';

export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  userId: number;
  isActive: boolean | null;
  maxParticipants: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: number;
  quizId: number;
  content: string;
  type: 'mcq' | 'tf' | 'short_answer';
  correctAnswer: string;
  options: string[] | null;
  points: number | null;
  createdAt: Date;
}

export interface CreateQuizInput {
  title: string;
  description?: string;
  userId: number;
  maxParticipants?: number;
}

export interface CreateQuestionInput {
  quizId: number;
  content: string;
  type: 'mcq' | 'tf' | 'short_answer';
  correctAnswer: string;
  options?: string[];
  points?: number;
}

export class QuizService {
  static async createQuiz(quizData: CreateQuizInput): Promise<Quiz> {
    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        title: quizData.title,
        description: quizData.description,
        userId: quizData.userId,
        maxParticipants: quizData.maxParticipants || 10,
      })
      .returning();

    if (!newQuiz) {
      throw new Error('Failed to create quiz');
    }

    return newQuiz;
  }

  static async getQuizById(quizId: number): Promise<Quiz | null> {
    const [result] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId));

    if (!result) {
      return null;
    }

    // Ensure all required fields have proper values
    return {
      ...result,
      description: result.description ?? null,
      isActive: result.isActive ?? null,
      maxParticipants: result.maxParticipants ?? null
    };
  }

  static async getUserQuizzes(userId: number): Promise<Quiz[]> {
    const results = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.createdAt));

    // Ensure all required fields have proper values
    return results.map(quiz => ({
      ...quiz,
      description: quiz.description ?? null,
      isActive: quiz.isActive ?? null,
      maxParticipants: quiz.maxParticipants ?? null
    }));
  }

  static async addQuestionToQuiz(questionData: CreateQuestionInput): Promise<Question> {
    const [newQuestion] = await db
      .insert(questions)
      .values({
        quizId: questionData.quizId,
        content: questionData.content,
        type: questionData.type,
        correctAnswer: questionData.correctAnswer,
        options: questionData.options,
        points: questionData.points || 1,
      })
      .returning();

    if (!newQuestion) {
      throw new Error('Failed to add question to quiz');
    }

    return newQuestion;
  }

  static async getQuestionsForQuiz(quizId: number): Promise<Question[]> {
    const results = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId));

    // Ensure all required fields have proper values
    return results.map(question => ({
      ...question,
      options: question.options ?? null,
      points: question.points ?? null
    }));
  }

  static async generateQuestionsFromDocument(
    quizId: number,
    documentTitle: string,
    documentContent: string,
    numQuestions: number = 5
  ): Promise<Question[]> {
    // Process the document with AI worker
    await AIWorkerService.processDocument({
      title: documentTitle,
      content: documentContent
    });

    // Generate questions from the processed document
    const aiGeneratedQuestions = await AIWorkerService.generateQuestionsFromDocument({
      title: documentTitle,
      content: documentContent
    }, numQuestions);

    // Add the generated questions to the quiz
    const addedQuestions: Question[] = [];
    for (const q of aiGeneratedQuestions) {
      const question = await QuizService.addQuestionToQuiz({
        quizId,
        content: q.content,
        type: q.type,
        correctAnswer: q.correctAnswer,
        options: q.options,
        points: q.points
      });
      addedQuestions.push(question);
    }

    return addedQuestions;
  }

  static async startQuiz(quizId: number): Promise<void> {
    await db
      .update(quizzes)
      .set({ isActive: true })
      .where(eq(quizzes.id, quizId));
  }

  static async endQuiz(quizId: number): Promise<void> {
    await db
      .update(quizzes)
      .set({ isActive: false })
      .where(eq(quizzes.id, quizId));
  }
}
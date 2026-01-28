import { type Request, type Response } from 'express';
import { QuizService } from '../services/quizService';
import { createQuizSchema } from '../types';

interface AuthRequest extends Request {
  userId?: number;
}

export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, maxParticipants } = createQuizSchema.parse(req.body);
    const userId = req.userId; // User ID from authentication middleware

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const newQuiz = await QuizService.createQuiz({
      title,
      description,
      userId,
      maxParticipants: maxParticipants || 10,
    });

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: newQuiz,
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllQuizzes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allQuizzes = await QuizService.getUserQuizzes(userId);

    res.status(200).json({
      quizzes: allQuizzes,
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuizById = async (req: AuthRequest, res: Response) => {
  try {
    const quizIdParam = req.params.id;
    if (!quizIdParam) {
      return res.status(400).json({ error: 'Quiz ID is required' });
    }
    const quizIdStr = Array.isArray(quizIdParam) ? quizIdParam[0] : quizIdParam;
    if (!quizIdStr) {
      return res.status(400).json({ error: 'Quiz ID is required' });
    }
    const quizId = parseInt(quizIdStr);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const quiz = await QuizService.getQuizById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Ensure the user owns this quiz
    if (quiz.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Also fetch questions for this quiz
    const questions = await QuizService.getQuestionsForQuiz(quizId);

    res.status(200).json({
      quiz,
      questions,
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// hooks/useQuiz.ts
import { useState } from 'react';
import { quizService } from '../services/api';
import { Quiz } from '../types';

export const useQuiz = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllQuizzes = async (options?: { limit?: number; offset?: number; isActive?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await quizService.getAllQuizzes(options);
      setQuizzes(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quizzes');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizById = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await quizService.getQuizById(id);
      setCurrentQuiz(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async (quizData: any) => {
    setLoading(true);
    setError(null);
    try {
      const newQuiz = await quizService.createQuiz(quizData);
      setQuizzes(prev => [...prev, newQuiz]);
      return newQuiz;
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createQuizWithAI = async (
    title: string,
    content: string,
    numQuestions: number,
    difficulty: string,
    description?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newQuiz = await quizService.createQuizWithAI(title, content, numQuestions, difficulty, description);
      setQuizzes(prev => [...prev, newQuiz]);
      return newQuiz;
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz with AI');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    quizzes,
    currentQuiz,
    loading,
    error,
    fetchAllQuizzes,
    fetchQuizById,
    createQuiz,
    createQuizWithAI,
  };
};
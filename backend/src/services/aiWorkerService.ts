import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PYTHON_WORKER_URL = process.env.PYTHON_WORKER_URL || 'http://localhost:8000';

interface Question {
  content: string;
  type: 'mcq' | 'tf' | 'short_answer';
  correctAnswer: string;
  options?: string[];
  points?: number;
}

interface Document {
  title: string;
  content: string;
}

export class AIWorkerService {
  static async generateQuestionsFromDocument(document: Document, numQuestions: number = 5): Promise<Question[]> {
    try {
      const response = await axios.post(`${PYTHON_WORKER_URL}/generate-questions`, {
        document,
        numQuestions
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.questions;
    } catch (error) {
      console.error('Error generating questions from document:', error);
      throw new Error('Failed to generate questions from document');
    }
  }

  static async evaluateAnswer(question: string, correctAnswer: string, userAnswer: string): Promise<boolean> {
    try {
      const response = await axios.post(`${PYTHON_WORKER_URL}/evaluate-answer`, {
        question,
        correctAnswer,
        userAnswer
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.isCorrect;
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw new Error('Failed to evaluate answer');
    }
  }

  static async processDocument(document: Document): Promise<void> {
    try {
      await axios.post(`${PYTHON_WORKER_URL}/process-document`, {
        document
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error('Failed to process document');
    }
  }
}
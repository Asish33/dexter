// hooks/useAnswer.ts
import { useState } from 'react';
import { answerService } from '../services/api';

export const useAnswer = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitAnswer = async (answerData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await answerService.submitAnswer(answerData);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submitAnswer,
  };
};
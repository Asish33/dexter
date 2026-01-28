// hooks/useDocument.ts
import { useState } from 'react';
import { documentService } from '../services/api';

export const useDocument = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const response = await documentService.uploadDocument(file);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processDocument = async (content: string, fileType: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await documentService.processDocument(content, fileType);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to process document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    uploadDocument,
    processDocument,
  };
};
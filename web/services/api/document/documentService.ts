// services/api/document/documentService.ts
import { makeRequest } from '../utils/requestHandler';
import { authService } from '../auth/authService';

export interface DocumentUploadData {
  file: File;
  fileName?: string;
}

export interface ProcessDocumentData {
  content: string;
  fileType: string;
}

class DocumentService {
  async uploadDocument(file: File): Promise<{ message: string; documentId?: string; error?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    // For file uploads, we need to let the browser set the Content-Type header
    // so we'll use fetch directly instead of makeRequest
    const token = await authService.getValidToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api'}/documents/upload-document`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include' // Include cookies in the request
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Upload failed');
    }

    return await response.json();
  }

  async processDocument(content: string, fileType: string): Promise<any> {
    return makeRequest('/documents/process-document', {
      method: 'POST',
      body: {
        content,
        fileType
      },
    });
  }
}

export const documentService = new DocumentService();
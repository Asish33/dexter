// services/api/utils/errorHandler.ts
export interface ApiErrorResponse {
  message: string;
  status: number;
  data?: any;
}

export const handleApiError = (error: any): ApiErrorResponse => {
  if (error.name === 'ApiError') {
    return {
      message: error.message,
      status: error.status,
      data: error.data
    };
  } else if (error instanceof TypeError) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      data: null
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred',
      status: 500,
      data: null
    };
  }
};
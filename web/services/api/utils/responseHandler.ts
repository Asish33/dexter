// services/api/utils/responseHandler.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message
});

export const createErrorResponse = (error: string, message?: string): ApiResponse<any> => ({
  success: false,
  error,
  message
});
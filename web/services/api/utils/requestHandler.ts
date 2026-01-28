// services/api/utils/requestHandler.ts
import { API_BASE_URL } from '../config';
import { authService } from '../auth/authService';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  authenticated?: boolean;
}

class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export const makeRequest = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const {
    method = 'GET',
    headers = {},
    body,
    authenticated = true,
  } = options;

  // Construct the full URL
  const url = `${API_BASE_URL}${endpoint}`;

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authentication token if needed
  if (authenticated) {
    const token = await authService.getValidToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    } else if (endpoint !== '/users/login' && endpoint !== '/users/register') {
      throw new ApiError('Authentication required', 401);
    }
  }

  // Prepare request body
  let requestBody: string | undefined;
  if (body && typeof body === 'object') {
    requestBody = JSON.stringify(body);
  } else if (typeof body === 'string') {
    requestBody = body;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      credentials: 'include' // Include cookies in the request
    });

    // Handle different response status codes
    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      let errorData = null;

      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          // If we can't parse the error, use the default message
        }
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle empty response body
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // For non-JSON responses, return text or empty object
      const text = await response.text();
      return text ? JSON.parse(text) : {} as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    } else if (error instanceof TypeError) {
      // Network error
      throw new ApiError('Network error. Please check your connection.', 0);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
};

export { ApiError };
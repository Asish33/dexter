// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService } from '../services/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          // In a real app, you might want to fetch user details here
          // const userData = await userService.getUserDetails();
          // setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      // Set tokens from the response
      authService.setTokens(response.token, response.refreshToken || '');
      setIsAuthenticated(true);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.register({ username, email, password });
      // Set tokens from the response
      authService.setTokens(response.token, response.refreshToken || '');
      setIsAuthenticated(true);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    logout,
  };
};
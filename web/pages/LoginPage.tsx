import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { GoogleLogo } from '../components/Icons';
import logo from '../assets/logo.png';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

import { useRef, useEffect } from 'react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { googleLogin, login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const googleLoginHandler = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar openid email profile',
    onSuccess: async (codeResponse) => {
      console.log('Google Login Success:', codeResponse);
      try {
        console.log('Sending code to backend...');
        const response = await googleLogin(codeResponse.code);
        console.log('Backend response:', response);
        console.log('Navigating to dashboard...');
        navigate('/dashboard');
      } catch (err) {
        console.error('Login Failed Detailed:', err);
        setError('Google login failed. Please try again.');
      }
    },
    onError: errorResponse => {
      console.log('Login Error', errorResponse);
      setError('Google login failed. Please try again.');
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50/50 dark:bg-background p-4 transition-colors">
      <div className="w-full max-w-[400px] bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 transition-colors">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="App Logo" className="w-12 h-12 mb-4 rounded-xl shadow-lg" />
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your details to sign in.</p>
        </div>

        <div className="space-y-4">
          <button onClick={() => googleLoginHandler()} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 rounded transition-colors font-medium text-sm">
            <GoogleLogo className="w-5 h-5" />
            Sign in with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                Email
              </label>
              <input
                className="flex h-10 w-full rounded border border-input dark:border-gray-700 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                id="email"
                placeholder="m@example.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs text-primary dark:text-white hover:underline">Forgot password?</a>
              </div>
              <input
                className="flex h-10 w-full rounded border border-input dark:border-gray-700 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button fullWidth type="submit" className="dark:bg-white dark:text-black dark:hover:bg-gray-200" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary dark:text-white hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
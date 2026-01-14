import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { GoogleLogo, BoltIcon } from '../components/Icons';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50/50 dark:bg-background p-4 transition-colors">
      <div className="w-full max-w-[400px] bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 transition-colors">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mb-4">
            <BoltIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your details to sign in.</p>
        </div>

        <div className="space-y-4">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 rounded transition-colors font-medium text-sm">
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
              />
            </div>
            <Button fullWidth type="submit" className="dark:bg-white dark:text-black dark:hover:bg-gray-200">Sign In</Button>
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
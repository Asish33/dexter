import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { GoogleLogo, BoltIcon } from '../components/Icons';
import { Logo } from '../components/Logo';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50/50 dark:bg-background p-4 transition-colors">
      <div className="w-full max-w-[400px] bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 transition-colors">
        <div className="flex flex-col items-center mb-8">
           <div className="w-12 h-12 bg-transparent text-primary-foreground rounded-lg flex items-center justify-center mb-4">
            <Logo className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground mt-2">Get started with Dexter today.</p>
        </div>

        <div className="space-y-4">
           <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 rounded transition-colors font-medium text-sm">
            <GoogleLogo className="w-5 h-5" />
            Sign up with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none" htmlFor="email">
                Email
              </label>
              <input
                className="flex h-10 w-full rounded border border-input dark:border-gray-700 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                id="email"
                placeholder="m@example.com"
                type="email"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                Password
              </label>
              <input
                className="flex h-10 w-full rounded border border-input dark:border-gray-700 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                id="password"
                type="password"
                required
              />
              <p className="text-[10px] text-muted-foreground">Must be at least 8 characters long</p>
            </div>
            <Button fullWidth type="submit" className="dark:bg-white dark:text-black dark:hover:bg-gray-200">Create Account</Button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary dark:text-white hover:underline">
            Log in
          </Link>
        </div>
        
        <p className="mt-4 px-4 text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
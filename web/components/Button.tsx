import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'glow' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  ...props 
}) => {
  // Changed rounded-md to rounded-full for modern SaaS look
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700",
    outline: "border border-ring bg-transparent hover:bg-gray-50 dark:hover:bg-white/10 text-foreground",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground hover:text-foreground",
    glow: "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.6)] border-none",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
  };

  const sizes = {
    sm: "h-8 px-4 text-sm",
    md: "h-10 px-6 py-2",
    lg: "h-12 px-8 text-lg",
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
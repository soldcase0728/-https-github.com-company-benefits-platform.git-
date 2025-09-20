import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

export function Button({ children, variant = 'default', className = '', ...props }: ButtonProps) {
  let base = 'inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  let variants: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  };
  return (
    <button className={`${base} ${variants[variant] || ''} ${className}`} {...props}>
      {children}
    </button>
  );
}


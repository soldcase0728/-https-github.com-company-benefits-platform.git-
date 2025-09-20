import React from 'react';

interface TabsProps {
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ children, className = '' }: TabsProps) {
  return <div className={`border-b ${className}`}>{children}</div>;
}

export function TabsList({ children, className = '' }: TabsProps) {
  return <div className={`flex gap-2 p-2 ${className}`}>{children}</div>;
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  className?: string;
}

export function TabsTrigger({ children, active, className = '', ...props }: TabsTriggerProps) {
  return (
    <button
      className={`px-4 py-2 rounded-t ${active ? 'bg-white border-b-2 border-blue-600' : 'bg-gray-100'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, className = '' }: TabsProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

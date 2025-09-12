'use client';

import * as React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file with cn function

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-semibold text-gray-800 mb-2"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-base",
            "ring-offset-background placeholder:text-gray-500",
            "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "shadow-sm hover:border-gray-400 transition-colors",
            error && "border-red-500 focus:ring-red-500 bg-red-50",
            className
          )}
          ref={ref}
          id={id}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

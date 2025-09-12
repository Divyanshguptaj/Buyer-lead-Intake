'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface SearchableDropdownProps {
  id: string;
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
}

export function SearchableDropdown({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  error,
  className,
  disabled = false,
  required = false,
  helperText
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  // Get the display value
  const displayValue = value ? value : placeholder;

  // Group options by first letter for better organization
  const groupedOptions = filteredOptions.reduce((groups, option) => {
    // Get the first letter or character
    const firstChar = option.charAt(0).toUpperCase();
    if (!groups[firstChar]) {
      groups[firstChar] = [];
    }
    groups[firstChar].push(option);
    return groups;
  }, {} as Record<string, string[]>);

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label 
          htmlFor={id} 
          className={cn(
            "block text-sm font-semibold text-gray-800 mb-2",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          id={id}
          className={cn(
            "flex h-11 w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-base justify-between items-center",
            "ring-offset-background placeholder:text-gray-500",
            "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "shadow-sm hover:border-gray-400 transition-colors",
            error && "border-red-500 focus:ring-red-500 bg-red-50",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">{displayValue}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg max-h-60 overflow-auto border border-gray-200">
            <div className="px-3 py-2 border-b border-gray-200">
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <ul className="py-1 divide-y divide-gray-100" role="listbox">
              {Object.keys(groupedOptions).sort().map((letter) => (
                <li key={letter} className="px-1">
                  <div className="sticky top-0 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-500">
                    {letter}
                  </div>
                  <ul>
                    {groupedOptions[letter].map((option) => (
                      <li
                        key={option}
                        className={cn(
                          "px-3 py-2 text-sm cursor-pointer hover:bg-blue-50",
                          value === option && "bg-blue-100 font-medium"
                        )}
                        onClick={() => {
                          onChange(option);
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                        role="option"
                        aria-selected={value === option}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              {filteredOptions.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-500">No results found</li>
              )}
            </ul>
          </div>
        )}
      </div>
      
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
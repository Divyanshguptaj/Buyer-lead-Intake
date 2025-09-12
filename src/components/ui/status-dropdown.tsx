'use client';

import React, { useState, useRef, useEffect } from 'react';
import { statusEnum } from '@/db/schema';

interface StatusDropdownProps {
  status: string;
  buyerId: string;
  onStatusChange: (buyerId: string, newStatus: string) => Promise<void>;
}

export function StatusDropdown({ status, buyerId, onStatusChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Status options and their corresponding colors
  const statusOptions: { value: string; label: string; color: string; bgColor: string }[] = [
    { value: 'New', label: 'New', color: 'text-blue-800', bgColor: 'bg-blue-100' },
    { value: 'Qualified', label: 'Qualified', color: 'text-green-800', bgColor: 'bg-green-100' },
    { value: 'Contacted', label: 'Contacted', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
    { value: 'Visited', label: 'Visited', color: 'text-purple-800', bgColor: 'bg-purple-100' },
    { value: 'Negotiation', label: 'Negotiation', color: 'text-orange-800', bgColor: 'bg-orange-100' },
    { value: 'Converted', label: 'Converted', color: 'text-emerald-800', bgColor: 'bg-emerald-100' },
    { value: 'Dropped', label: 'Dropped', color: 'text-red-800', bgColor: 'bg-red-100' },
  ];

  const currentStatus = statusOptions.find(option => option.value === status) || statusOptions[0];
  
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) {
      setIsOpen(false);
      return;
    }
    
    try {
      setIsLoading(true);
      await onStatusChange(buyerId, newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className={`inline-flex justify-center w-full rounded-full px-2 py-1 text-xs font-semibold 
          ${currentStatus.bgColor} ${currentStatus.color} focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
          id={`status-dropdown-${buyerId}`}
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          {currentStatus.label}
          <svg className="-mr-1 ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div 
          className="origin-top-left absolute left-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          role="menu" 
          aria-orientation="vertical" 
          aria-labelledby={`status-dropdown-${buyerId}`}
        >
          <div className="py-1" role="none">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 
                ${status === option.value ? 'bg-gray-50 font-medium' : 'text-gray-700'}`}
                role="menuitem"
                onClick={() => handleStatusChange(option.value)}
                disabled={isLoading}
              >
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${option.bgColor}`}></span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-full">
          <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
}

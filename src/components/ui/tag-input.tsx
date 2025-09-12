'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
  className?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  minTags?: number;
}

export function TagInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder = 'Add tags...',
  maxTags = 10,
  className = '',
  disabled = false,
  error = '',
  required = false,
  minTags = 0
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    // Filter suggestions based on input value
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) && 
          !value.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, suggestions, value]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
      const newTags = [...value, trimmedTag];
      onChange(newTags);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    setActiveSuggestionIndex(0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter or comma if there's input
    if ((e.key === 'Enter' || e.key === ',') && inputValue) {
      e.preventDefault();
      
      // If a suggestion is active and visible, use it
      if (showSuggestions && filteredSuggestions.length > 0 && activeSuggestionIndex >= 0) {
        addTag(filteredSuggestions[activeSuggestionIndex]);
      } else {
        addTag(inputValue);
      }
    } 
    // Remove last tag on Backspace if input is empty
    else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
    // Navigate suggestions with arrow keys
    else if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
      e.preventDefault();
      setActiveSuggestionIndex(prevIndex => 
        prevIndex < filteredSuggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    }
    else if (e.key === 'ArrowUp' && filteredSuggestions.length > 0) {
      e.preventDefault();
      setActiveSuggestionIndex(prevIndex => prevIndex > 0 ? prevIndex - 1 : 0);
    }
    // Close suggestions on Escape
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      suggestionListRef.current && 
      !suggestionListRef.current.contains(e.target as Node) &&
      inputRef.current && 
      !inputRef.current.contains(e.target as Node)
    ) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={`border rounded-md p-2 bg-white ${error ? 'border-red-500' : ''} ${className}`}>
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => {
          // Determine tag color based on category
          const tagClass = 
            tag.includes("Hot") || tag.includes("Urgent") || tag.includes("VIP") || tag.includes("Premium") || tag.includes("High Priority")
              ? "bg-red-100 text-red-800" 
            : tag.includes("Investor") || tag.includes("End User") || tag.includes("Cash Buyer") || tag.includes("First Time") || tag.includes("Repeat Client")
              ? "bg-blue-100 text-blue-800"
            : tag.includes("Budget") || tag.includes("Negotiable")
              ? "bg-green-100 text-green-800"
            : tag.includes("Follow Up") || tag.includes("Viewed") || tag.includes("Interested") || tag.includes("Not Interested") || tag.includes("Closed")
              ? "bg-purple-100 text-purple-800"
            : tag.includes("Ready") || tag.includes("Under Construction") || tag.includes("Off Plan") || tag.includes("Resale")
              ? "bg-amber-100 text-amber-800"
            : "bg-blue-100 text-blue-800";
            
          const buttonClass = 
            tag.includes("Hot") || tag.includes("Urgent") || tag.includes("VIP") || tag.includes("Premium") || tag.includes("High Priority")
              ? "text-red-600 hover:text-red-800" 
            : tag.includes("Investor") || tag.includes("End User") || tag.includes("Cash Buyer") || tag.includes("First Time") || tag.includes("Repeat Client")
              ? "text-blue-600 hover:text-blue-800"
            : tag.includes("Budget") || tag.includes("Negotiable")
              ? "text-green-600 hover:text-green-800"
            : tag.includes("Follow Up") || tag.includes("Viewed") || tag.includes("Interested") || tag.includes("Not Interested") || tag.includes("Closed")
              ? "text-purple-600 hover:text-purple-800"
            : tag.includes("Ready") || tag.includes("Under Construction") || tag.includes("Off Plan") || tag.includes("Resale")
              ? "text-amber-600 hover:text-amber-800"
            : "text-blue-600 hover:text-blue-800";
            
          return (
            <div 
              key={`${tag}-${index}`} 
              className={`flex items-center ${tagClass} px-2 py-1 rounded-full text-sm`}
            >
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  className={`ml-1 ${buttonClass} focus:outline-none`}
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove ${tag} tag`}
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
        
        {!disabled && value.length < maxTags && (
          <div className="relative flex-grow">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className="w-full min-w-[120px] py-1 px-2 border-none focus:outline-none focus:ring-0 text-sm"
              placeholder={value.length === 0 ? placeholder : ''}
              aria-label="Tag input"
              disabled={disabled}
            />
            
            {showSuggestions && filteredSuggestions.length > 0 && (
              <ul 
                ref={suggestionListRef}
                className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-auto"
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <li
                    key={suggestion}
                    className={`px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm ${
                      index === activeSuggestionIndex ? 'bg-blue-50' : ''
                    } ${
                      // Add visual indicators for tag categories
                      suggestion.includes("Hot") || suggestion.includes("Urgent") || suggestion.includes("VIP") || suggestion.includes("Premium") || suggestion.includes("High Priority")
                        ? 'border-l-4 border-red-500' 
                        : suggestion.includes("Investor") || suggestion.includes("End User") || suggestion.includes("Cash Buyer") || suggestion.includes("First Time") || suggestion.includes("Repeat Client")
                        ? 'border-l-4 border-blue-500'
                        : suggestion.includes("Budget") || suggestion.includes("Negotiable")
                        ? 'border-l-4 border-green-500'
                        : suggestion.includes("Follow Up") || suggestion.includes("Viewed") || suggestion.includes("Interested") || suggestion.includes("Not Interested") || suggestion.includes("Closed")
                        ? 'border-l-4 border-purple-500'
                        : suggestion.includes("Ready") || suggestion.includes("Under Construction") || suggestion.includes("Off Plan") || suggestion.includes("Resale")
                        ? 'border-l-4 border-amber-500'
                        : ''
                    }`}
                    onClick={() => addTag(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      {disabled && value.length === 0 && (
        <span className="text-gray-400 text-sm">{placeholder}</span>
      )}
      
      {!disabled && value.length >= maxTags && (
        <p className="text-sm text-gray-500 mt-1">Maximum {maxTags} tags allowed.</p>
      )}
      
      {required && value.length < minTags && (
        <p className="text-sm text-amber-600 mt-1">At least {minTags} tag(s) required.</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

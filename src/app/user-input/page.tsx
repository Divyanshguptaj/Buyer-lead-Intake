'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function UserInputExample() {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`You entered: ${inputValue}`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Input Example</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your Name"
          placeholder="Enter your name"
          value={inputValue}
          onChange={handleChange}
          id="user-input"
        />
        
        <div className="mt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </form>
      
      {inputValue && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Live Preview:</h2>
          <p>You are typing: {inputValue}</p>
        </div>
      )}
    </div>
  );
}
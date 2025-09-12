'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';

// Define the form schema with validation rules
const formSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must be at most 20 characters" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
  message: z.string()
    .min(10, { message: "Message must be at least 10 characters" })
});

type FormValues = z.infer<typeof formSchema>;

export default function ValidatedFormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      message: ''
    }
  });

  const onSubmit = async (data: FormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Form submitted:', data);
    alert(`Form submitted successfully!\n\nUsername: ${data.username}\nEmail: ${data.email}\nMessage: ${data.message}`);
    reset();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Validated Form Example</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <Input
          label="Username"
          placeholder="Enter your username"
          error={errors.username?.message}
          {...register('username')}
        />
        
        <Input
          label="Email"
          type="email"
          placeholder="your.email@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <div className="w-full">
          <label 
            htmlFor="message" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            placeholder="Enter your message"
            className={`w-full rounded-md border ${errors.message ? 'border-red-500' : 'border-gray-300'} p-3 h-32`}
            {...register('message')}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-500">
              {errors.message.message}
            </p>
          )}
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </div>
  );
}
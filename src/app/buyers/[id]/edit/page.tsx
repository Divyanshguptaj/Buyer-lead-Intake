"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BuyerForm } from '@/components/buyer-form';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BuyerEditPage({ params }: PageProps) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  
  const [buyer, setBuyer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push('/auth/signin');
    }
  }, [sessionStatus, router]);
  
  // Fetch buyer data
  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      return;
    }
    
    async function fetchBuyerData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/buyers/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/signin');
            return;
          }
          throw new Error(`Failed to fetch buyer data: ${response.status}`);
        }
        
        const data = await response.json();
        setBuyer(data);
      } catch (err) {
        console.error('Error fetching buyer data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBuyerData();
  }, [id, sessionStatus, router]);
  
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(`/api/buyers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          updatedAt: buyer?.updatedAt, // Include for concurrency check
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin');
          return;
        }
        
        if (response.status === 409) {
          throw new Error('This record was modified by another user. Please refresh and try again.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update buyer: ${response.status}`);
      }
      
      setSuccessMessage('Buyer updated successfully');
      
      // Redirect to buyer details after a brief delay
      setTimeout(() => {
        router.push(`/buyers/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating buyer:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  if (error && !buyer) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-red-700">Error: {error}</p>
            <div className="mt-4">
              <Link 
                href="/buyers"
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Back to Buyers
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Buyer: {buyer?.fullName}</h1>
        <Link 
          href={`/buyers/${id}`}
          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
        >
          Cancel
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">Error: {error}</p>
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        {buyer && (
          <BuyerForm
            initialData={buyer}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
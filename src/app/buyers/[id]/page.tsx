"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BuyerForm } from '@/components/buyer-form';

interface PageProps {
  params: {
    id: string;
  };
}

export default function BuyerDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;
  
  const [buyer, setBuyer] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch buyer data
  useEffect(() => {
    async function fetchBuyerData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/buyers/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch buyer data');
        }
        
        const data = await response.json();
        setBuyer(data.buyer);
        setHistory(data.history || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBuyerData();
  }, [id]);
  
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Include the updatedAt timestamp for optimistic concurrency control
      const formData = {
        ...data,
        id,
        updatedAt: buyer?.updatedAt,
      };
      
      const response = await fetch(`/api/buyers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.status === 409) {
        throw new Error('This record has been modified by someone else. Please refresh and try again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update buyer');
      }
      
      // Refresh the page to get the latest data including history
      router.refresh();
      
      // Update the local state with the new data
      const data = await response.json();
      setBuyer(data.buyer);
      setHistory(data.history || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the buyer');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        Error: {error}
      </div>
    );
  }
  
  if (!buyer) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded">
        Buyer not found
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Buyer: {buyer.fullName}</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <BuyerForm 
          initialData={buyer} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </div>
      
      {/* History Section */}
      {history.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Change History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Changed By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Changes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((entry: any) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.changedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.changedBy?.name || entry.changedBy?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <ul className="list-disc list-inside">
                        {Object.entries(entry.diff).map(([key, value]: [string, any]) => (
                          <li key={key}>
                            <span className="font-medium">{key}:</span>{' '}
                            {value.old !== undefined ? `${value.old}` : 'none'} → {value.new !== undefined ? `${value.new}` : 'none'}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

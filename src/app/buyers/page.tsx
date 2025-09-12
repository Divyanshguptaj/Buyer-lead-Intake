"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BuyerTable } from '@/components/buyer-table';
import { FilterBar } from '@/components/filter-bar';
import Link from 'next/link';
import { BuyerType } from '@/db';

export default function BuyersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse query parameters
  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const propertyType = searchParams.get('propertyType') || '';
  const status = searchParams.get('status') || '';
  const timeline = searchParams.get('timeline') || '';
  
  // State for buyers and pagination
  const [buyers, setBuyers] = useState<BuyerType[]>([]);
  const [pagination, setPagination] = useState({
    page: page,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push('/auth/signin');
    }
  }, [sessionStatus, router]);

  // Fetch buyers data
  useEffect(() => {
    // Don't fetch if not authenticated
    if (sessionStatus !== "authenticated") {
      return;
    }
    
    async function fetchBuyers() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Build the query string
        const queryParams = new URLSearchParams();
        queryParams.set('page', String(page));
        queryParams.set('limit', String(pagination.limit));
        
        if (search) queryParams.set('search', search);
        if (city) queryParams.set('city', city);
        if (propertyType) queryParams.set('propertyType', propertyType);
        if (status) queryParams.set('status', status);
        if (timeline) queryParams.set('timeline', timeline);
        
        console.log(`Fetching buyers with params: ${queryParams.toString()}`);
        const response = await fetch(`/api/buyers?${queryParams.toString()}`, {
          cache: 'no-store',
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error: ${response.status}`, errorText);
          
          // If unauthorized, redirect to login
          if (response.status === 401) {
            router.push('/auth/signin');
            return;
          }
          
          throw new Error(`Failed to fetch buyers data: ${response.status} ${errorText}`);
        }
        
        // Check if there's content before parsing JSON
        const responseText = await response.text();
        if (!responseText) {
          console.error("Empty response received from API");
          throw new Error("API returned an empty response");
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Buyers data received:', data);
          setBuyers(data.buyers || []);
          setPagination({
            page: data.pagination?.page || page,
            limit: data.pagination?.limit || pagination.limit,
            total: data.pagination?.total || 0,
            totalPages: data.pagination?.totalPages || 0
          });
        } catch (parseError) {
          console.error("JSON parsing error:", parseError, "Response text:", responseText);
          throw new Error("Failed to parse API response as JSON");
        }
      } catch (err) {
        console.error('Error fetching buyers:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBuyers();
  }, [page, search, city, propertyType, status, timeline, sessionStatus, pagination.limit]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    // Create a new URLSearchParams object from the current query
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/buyers?${params.toString()}`);
  };
  
  // Handle status change
  const handleStatusChange = async (buyerId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/buyers/${buyerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      
      // Handle unauthorized error
      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to update buyer status');
      }
      
      // Update the buyer in the local state for immediate UI update
      setBuyers(prevBuyers => 
        prevBuyers.map(buyer => 
          buyer.id === buyerId 
            ? { ...buyer, status: newStatus } 
            : buyer
        )
      );
      
      // Check if there's content before parsing JSON
      const responseText = await response.text();
      if (!responseText) {
        return {}; // Return empty object if no response
      }
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        return {}; // Return empty object if parsing fails
      }
    } catch (error) {
      console.error('Error updating buyer status:', error);
      throw error;
    }
  };
  
  // Handle filter change - this function handles all filter changes including search
  
  // This function now handles all filter changes, including search
  const handleFilterChange = (filterName: string, value: string) => {
    // Create a new URLSearchParams object from the current query
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page to 1 when filters change
    params.set('page', '1');
    
    // Update the specific filter
    if (value) {
      params.set(filterName, value);
    } else {
      params.delete(filterName);
    }
    
    router.push(`/buyers?${params.toString()}`);
  };
  
  // Handle export CSV
  const handleExportCSV = async () => {
    try {
      // Build the query string to include all current filters
      const queryParams = new URLSearchParams();
      
      if (search) queryParams.set('search', search);
      if (city) queryParams.set('city', city);
      if (propertyType) queryParams.set('propertyType', propertyType);
      if (status) queryParams.set('status', status);
      if (timeline) queryParams.set('timeline', timeline);
      
      // Create a Blob with the CSV content
      const response = await fetch(`/api/buyers/export?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      // Get the CSV content from the response
      const csvContent = await response.text();
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `buyers-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export CSV');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Buyer Leads</h1>
        <div className="flex space-x-4">
          <Link 
            href="/buyers/import"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Import CSV
          </Link>
          <button 
            onClick={handleExportCSV} 
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Export CSV
          </button>
          <Link 
            href="/buyers/new"
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            Add New Lead
          </Link>
        </div>
      </div>
      
      <FilterBar 
        filters={{
          search,
          city,
          propertyType,
          status,
          timeline
        }}
        onFilterChange={handleFilterChange}
      />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          Error: {error}
        </div>
      ) : buyers.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No buyer leads found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters, or add your first lead.</p>
          <Link 
            href="/buyers/new"
            className="inline-flex items-center justify-center bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            Add New Lead
          </Link>
        </div>
      ) : (
        <BuyerTable 
          buyers={buyers} 
          pagination={pagination}
          onPageChange={handlePageChange}
          onStatusChange={handleStatusChange}
          canChangeStatus={true}
        />
      )}
    </div>
  );
}

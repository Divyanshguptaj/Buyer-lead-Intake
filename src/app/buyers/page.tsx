"use client";

import React, { useState, useEffect, useCallback, JSX } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BuyerTable } from '@/components/buyer-table';
import { FilterBar } from '@/components/filter-bar';
import Link from 'next/link';
import { BuyerType } from '@/lib/db';
import { Download, Upload, Plus, Users, AlertCircle, RefreshCw } from 'lucide-react';

// Proper TypeScript interfaces
interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  status: string;
  timeline: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}


export default function BuyersPage(): JSX.Element {
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
  
  // State for buyers and pagination with proper typing
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: page,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push('/auth/signin');
    }
  }, [sessionStatus, router]);

  // Fetch buyers data
  const fetchBuyers = useCallback(async () => {
    // Don't fetch if not authenticated
    if (sessionStatus !== "authenticated") {
      return;
    }
    
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
      
      let data: any;
      try {
        data = JSON.parse(responseText);
        console.log('Buyers data received:', data);
        setBuyers(data.buyers || []);
        setPagination(prev => ({
          ...prev,
          page: data.pagination?.page || page,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0
        }));
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
  }, [page, search, city, propertyType, status, timeline, sessionStatus, pagination.limit, router]);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);
  
  // Handle page change
  const handlePageChange = useCallback((newPage: number): void => {
    // Create a new URLSearchParams object from the current query
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/buyers?${params.toString()}`);
  }, [searchParams, router]);
  
  // Handle status change
  const handleStatusChange = useCallback(async (buyerId: string, newStatus: string): Promise<void> => {
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
        return; // Return void if no response
      }
      
      try {
        JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
      }
    } catch (error) {
      console.error('Error updating buyer status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update status');
    }
  }, [router]);
  
  // Handle filter change with proper debouncing
  const handleFilterChange = useCallback((filterName: string, value: string): void => {
    // Create a new URLSearchParams object from the current query
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page to 1 when filters change
    params.set('page', '1');
    
    // Update the specific filter
    if (value && value.trim()) {
      params.set(filterName, value.trim());
    } else {
      params.delete(filterName);
    }
    
    // Use replace instead of push for smoother navigation
    const newUrl = `/buyers?${params.toString()}`;
    router.replace(newUrl);
  }, [searchParams, router]);
  
  // Handle export CSV
  const handleExportCSV = useCallback(async (): Promise<void> => {
    try {
      // Build the query string to include all current filters
      const queryParams = new URLSearchParams();
      
      if (search) queryParams.set('search', search);
      if (city) queryParams.set('city', city);
      if (propertyType) queryParams.set('propertyType', propertyType);
      if (status) queryParams.set('status', status);
      if (timeline) queryParams.set('timeline', timeline);
      
      // Create a Blob with the CSV content
      const response = await fetch(`/api/buyers/export?${queryParams.toString()}`, {
        credentials: 'include'
      });
      
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
  }, [search, city, propertyType, status, timeline]);

  // Handle refresh
  const handleRefresh = useCallback((): void => {
    fetchBuyers();
  }, [fetchBuyers]);
  
  // Early return for unauthenticated users
  if (sessionStatus === "unauthenticated") {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-indigo-500/5 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Buyer Leads
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and track your property buyer leads
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/buyers/import"
                className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-105"
              >
                <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                Import CSV
              </Link>
              <button 
                onClick={handleExportCSV} 
                className="group flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-green-500/25 transition-all duration-200 transform hover:scale-105"
              >
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                Export CSV
              </button>
              <Link 
                href="/buyers/new"
                className="group flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                Add New Lead
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl shadow-indigo-500/5 p-6">
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
        </div>
        
        {/* Content Section */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl shadow-indigo-500/5 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <RefreshCw className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="text-gray-600 mt-4 font-medium">Loading buyer leads...</p>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Error Loading Data</h3>
                  <p className="text-red-700">{error}</p>
                  <button 
                    onClick={handleRefresh}
                    className="mt-3 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : buyers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">No buyer leads found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Try adjusting your search or filters, or add your first lead to get started.
              </p>
              <Link 
                href="/buyers/new"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                Add Your First Lead
              </Link>
            </div>
          ) : (
            <div className="p-6">
              {/* Stats Bar */}
              <div className="mb-6 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    Showing {buyers.length} of {pagination.total} leads
                  </span>
                  {(search || city || propertyType || status || timeline) && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      Filtered
                    </span>
                  )}
                </div>
                <div className="text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
              </div>

              <BuyerTable 
                buyers={buyers} 
                pagination={pagination}
                onPageChange={handlePageChange}
                onStatusChange={handleStatusChange}
                canChangeStatus={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useCallback, JSX } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import {
  cityEnum,
  propertyTypeEnum,
  statusEnum,
  timelineEnum,
} from '@/db/schema';

interface FilterBarProps {
  filters: {
    search?: string;
    city?: string;
    propertyType?: string;
    status?: string;
    timeline?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  };
  onFilterChange: (name: string, value: string) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps): JSX.Element {
  // Local state for search input to handle immediate updates
  const [localSearchValue, setLocalSearchValue] = useState(filters.search || '');
  
  // Sync local state with external filters
  useEffect(() => {
    setLocalSearchValue(filters.search || '');
  }, [filters.search]);

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchValue !== filters.search) {
        onFilterChange('search', localSearchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchValue, filters.search, onFilterChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchValue(e.target.value);
  }, []);

  const handleFilterChange = useCallback((
    e: React.ChangeEvent<HTMLSelectElement>,
    filterName: string
  ) => {
    onFilterChange(filterName, e.target.value);
  }, [onFilterChange]);

  const clearAllFilters = useCallback(() => {
    setLocalSearchValue('');
    onFilterChange('search', '');
    onFilterChange('city', '');
    onFilterChange('propertyType', '');
    onFilterChange('status', '');
    onFilterChange('timeline', '');
    onFilterChange('sort', 'updatedAt');
    onFilterChange('order', 'desc');
  }, [onFilterChange]);

  const hasActiveFilters = !!(
    filters.search || 
    filters.city || 
    filters.propertyType || 
    filters.status || 
    filters.timeline
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Search & Filter
            </h2>
            <p className="text-sm text-gray-500">Find and organize your buyer leads</p>
          </div>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors group"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Clear All
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={localSearchValue}
          onChange={handleSearchChange}
          className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
        {localSearchValue && (
          <button
            onClick={() => {
              setLocalSearchValue('');
              onFilterChange('search', '');
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* City Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            City
          </label>
          <div className="relative">
            <select
              value={filters.city || ''}
              onChange={(e) => handleFilterChange(e, 'city')}
              className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Cities</option>
              {cityEnum.options.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Property Type Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Property Type
          </label>
          <div className="relative">
            <select
              value={filters.propertyType || ''}
              onChange={(e) => handleFilterChange(e, 'propertyType')}
              className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Types</option>
              {propertyTypeEnum.options.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <div className="relative">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange(e, 'status')}
              className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Statuses</option>
              {statusEnum.options.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Timeline Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Timeline
          </label>
          <div className="relative">
            <select
              value={filters.timeline || ''}
              onChange={(e) => handleFilterChange(e, 'timeline')}
              className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Timelines</option>
              {timelineEnum.options.map((timeline) => (
                <option key={timeline} value={timeline}>
                  {timeline}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={filters.sort || 'updatedAt'}
                onChange={(e) => handleFilterChange(e, 'sort')}
                className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="updatedAt">Updated</option>
                <option value="fullName">Name</option>
                <option value="city">City</option>
                <option value="propertyType">Type</option>
                <option value="status">Status</option>
                <option value="timeline">Timeline</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative w-20">
              <select
                value={filters.order || 'desc'}
                onChange={(e) => handleFilterChange(e, 'order')}
                className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl px-3 py-3 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="desc">↓</option>
                <option value="asc">↑</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">Active filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              Search: "{filters.search}"
              <button
                onClick={() => {
                  setLocalSearchValue('');
                  onFilterChange('search', '');
                }}
                className="hover:text-indigo-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.city && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              City: {filters.city}
              <button
                onClick={() => onFilterChange('city', '')}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.propertyType && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Type: {filters.propertyType}
              <button
                onClick={() => onFilterChange('propertyType', '')}
                className="hover:text-green-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              Status: {filters.status}
              <button
                onClick={() => onFilterChange('status', '')}
                className="hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.timeline && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              Timeline: {filters.timeline}
              <button
                onClick={() => onFilterChange('timeline', '')}
                className="hover:text-orange-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
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

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  // Debounce search input
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search with 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange('search', searchInput);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    filterName: string
  ) => {
    onFilterChange(filterName, e.target.value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Search & Filter</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by name, email or phone"
              value={filters.search || ''}
              onChange={handleSearchChange}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <select
            id="city"
            name="city"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filters.city || ''}
            onChange={(e) => handleFilterChange(e, 'city')}
          >
            <option value="">All Cities</option>
            {cityEnum.options.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
            Property Type
          </label>
          <select
            id="propertyType"
            name="propertyType"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filters.propertyType || ''}
            onChange={(e) => handleFilterChange(e, 'propertyType')}
          >
            <option value="">All Types</option>
            {propertyTypeEnum.options.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange(e, 'status')}
          >
            <option value="">All Statuses</option>
            {statusEnum.options.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Timeline */}
        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
            Timeline
          </label>
          <select
            id="timeline"
            name="timeline"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filters.timeline || ''}
            onChange={(e) => handleFilterChange(e, 'timeline')}
          >
            <option value="">All Timelines</option>
            {timelineEnum.options.map((timeline) => (
              <option key={timeline} value={timeline}>
                {timeline}
              </option>
            ))}
          </select>
        </div>
        
        {/* Sort */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <div className="flex gap-1">
            <select
              id="sort"
              name="sort"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filters.sort || 'updatedAt'}
              onChange={(e) => handleFilterChange(e, 'sort')}
            >
              <option value="updatedAt">Last Updated</option>
              <option value="fullName">Name</option>
              <option value="city">City</option>
              <option value="propertyType">Property Type</option>
              <option value="status">Status</option>
              <option value="timeline">Timeline</option>
            </select>
            
            <select
              id="order"
              name="order"
              className="mt-1 block w-20 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filters.order || 'desc'}
              onChange={(e) => handleFilterChange(e, 'order')}
            >
              <option value="desc">DESC</option>
              <option value="asc">ASC</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

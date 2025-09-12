import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { Users, Plus, Home, LogOut, User, Building2 } from 'lucide-react';

export async function NavBar() {
  const user = await getCurrentUser();
  
  return (
    <nav className="relative bg-white/80 backdrop-blur-xl border-b border-black/50 shadow-xl shadow-indigo-500/5">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-white/50 to-blue-50/50"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <Link 
              href="/" 
              className="group flex items-center gap-2"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-blue-700 transition-all duration-300">
                Buyer Lead Intake
              </span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {/* Main Navigation */}
            <div className="flex items-center gap-1 mr-6">
              <Link
                href="/buyers"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200"
              >
                <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Buyers</span>
              </Link>
              
              <Link
                href="/buyers/new"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                <span className="font-medium">Add New</span>
              </Link>
            </div>
            
            {/* User Section */}
            <div className="flex items-center">
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-4"></div>
              
              {user ? (
                <div className="flex items-center gap-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-xl border border-indigo-100/50">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 leading-tight">
                        {user.name || 'Admin'}
                      </span>
                      <span className="text-xs text-gray-500 leading-tight">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  
                  {/* Sign Out Button */}
                  <Link
                    href="/api/auth/signout"
                    className="group flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-red-500/25 transition-all duration-200 transform hover:scale-105"
                  >
                    <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    <span className="text-sm">Sign Out</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-6 py-2 rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:scale-105"
                >
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
    </nav>
  );
}
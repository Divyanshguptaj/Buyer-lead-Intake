import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export async function NavBar() {
  const user = await getCurrentUser();
  
  return (
    <nav className="bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <Link href="/" className="text-xl font-bold">
            Buyer Lead Intake
          </Link>
        </div>
        
        <div className="space-x-4 flex items-center">
          <Link href="/buyers" className="hover:text-slate-300">
            Buyers
          </Link>
          <Link href="/buyers/new" className="hover:text-slate-300">
            Add New
          </Link>
          
          <div className="pl-4 ml-4 border-l border-slate-600">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">{user.email}</span>
                <Link
                  href="/api/auth/signout"
                  className="bg-red-600 text-xs px-2 py-1 rounded hover:bg-red-700"
                >
                  Sign Out
                </Link>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-blue-600 text-xs px-2 py-1 rounded hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

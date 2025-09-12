'use client';

import { ErrorBoundary } from 'react-error-boundary';
import React from 'react';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-xl font-bold text-red-700 mb-4">Something went wrong</h2>
        <p className="text-gray-700 mb-4">We're sorry, an unexpected error has occurred.</p>
        <div className="bg-gray-100 p-4 rounded-md overflow-auto">
          <pre className="text-sm text-gray-800">{error.message}</pre>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

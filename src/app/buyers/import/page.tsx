"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ImportCSVPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{ row: number; errors: string[] }[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrors([]);
      setSuccessCount(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;
    
    setIsUploading(true);
    setErrors([]);
    setSuccessCount(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/buyers/import', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setErrors(result.errors || []);
        return;
      }
      
      setSuccessCount(result.success);
      
      // If there are no errors, redirect back to buyers page after a short delay
      if (!result.errors || result.errors.length === 0) {
        setTimeout(() => {
          router.push('/buyers');
        }, 2000);
      } else {
        setErrors(result.errors);
      }
    } catch (err) {
      setErrors([{ row: 0, errors: [err instanceof Error ? err.message : 'An unknown error occurred'] }]);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Import Buyers CSV</h1>
        <Link 
          href="/buyers"
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Back to Buyers
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">CSV Format Requirements</h2>
          <p className="text-gray-600 mb-2">Your CSV file must have the following headers:</p>
          <code className="bg-gray-100 p-2 block rounded text-sm font-mono mb-2">
            fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
          </code>
          <ul className="list-disc pl-5 text-gray-600 text-sm">
            <li><strong>fullName:</strong> 2-80 characters</li>
            <li><strong>phone:</strong> 10-15 digits (required)</li>
            <li><strong>email:</strong> valid email (optional)</li>
            <li><strong>city:</strong> Chandigarh, Mohali, Zirakpur, Panchkula, or Other</li>
            <li><strong>propertyType:</strong> Apartment, Villa, Plot, Office, or Retail</li>
            <li><strong>bhk:</strong> 1, 2, 3, 4, or Studio (required for Apartment/Villa)</li>
            <li><strong>purpose:</strong> Buy or Rent</li>
            <li><strong>budgetMin/budgetMax:</strong> Numbers (optional)</li>
            <li><strong>timeline:</strong> 0-3m, 3-6m, {'>'}-6m, or Exploring</li>
            <li><strong>source:</strong> Website, Referral, Walk-in, Call, or Other</li>
            <li><strong>notes:</strong> Text up to 1000 chars (optional)</li>
            <li><strong>tags:</strong> Comma-separated values (optional)</li>
            <li><strong>status:</strong> New, Qualified, Contacted, Visited, Negotiation, Converted, or Dropped (defaults to New)</li>
          </ul>
          <p className="text-gray-600 mt-2">Maximum 200 rows allowed per import.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={!file || isUploading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !file || isUploading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Import CSV'
              )}
            </button>
          </div>
        </form>
        
        {successCount !== null && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded p-4 text-green-700">
            Successfully imported {successCount} buyer records.
          </div>
        )}
        
        {errors.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-red-700 mb-2">Validation Errors</h3>
            <div className="bg-red-50 border border-red-200 rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-red-200">
                  <thead className="bg-red-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                        Row #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                        Errors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-red-200">
                    {errors.map((error, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {error.row === 0 ? 'General' : error.row}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <ul className="list-disc pl-5">
                            {error.errors.map((errorMsg, errorIndex) => (
                              <li key={errorIndex}>{errorMsg}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

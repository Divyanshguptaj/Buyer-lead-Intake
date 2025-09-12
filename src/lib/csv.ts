import { stringify } from 'csv-stringify/sync';
import { z } from 'zod';
import { csvImportSchema } from '@/db/schema';

export async function parseCSV(file: File) {
  const content = await file.text();
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const results: Record<string, string>[] = [];
  const errors: { row: number; errors: string[] }[] = [];
  
  // Parse the CSV data manually
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const rowData: Record<string, string> = {};
    const values = lines[i].split(',').map(val => val.trim());
    
    headers.forEach((header, index) => {
      rowData[header] = values[index] || '';
    });
    
    // Convert budgets to numbers
    if (rowData.budgetMin) rowData.budgetMin = rowData.budgetMin.toString();
    if (rowData.budgetMax) rowData.budgetMax = rowData.budgetMax.toString();
    
    results.push(rowData);
  }
  
  // Validate the entire dataset using Zod
  const validation = csvImportSchema.safeParse(results);
  
  if (!validation.success) {
    // Map Zod errors to row numbers
    for (const issue of validation.error.issues) {
      const rowPath = issue.path[0]; // Get the row index
      const rowNumber = parseInt(rowPath as string, 10) + 1; // Add 1 to make it 1-indexed for user
      const fieldPath = issue.path.slice(1).join('.'); // Get the field path
      
      const existingRowError = errors.find(e => e.row === rowNumber);
      if (existingRowError) {
        existingRowError.errors.push(`${fieldPath}: ${issue.message}`);
      } else {
        errors.push({
          row: rowNumber,
          errors: [`${fieldPath}: ${issue.message}`]
        });
      }
    }
    
    return { data: null, errors };
  }
  
  return { data: validation.data, errors };
}

export function createCSV<T extends object>(data: T[]) {
  return stringify(data, { header: true });
}

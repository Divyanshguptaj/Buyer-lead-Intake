import { z } from 'zod';

// This test file validates the budget validation logic that would be present in your form schema
describe('Budget validation', () => {
  // Create a simplified schema just for testing budget validation
  const createBudgetSchema = (budget: number | string | null, maxBudget: number | string | null) => {
    return z.object({
      budget: z.number().nullable().refine(
        (val) => val === null || val >= 0,
        { message: 'Budget must be a positive number or zero' }
      ),
      maxBudget: z.number().nullable().refine(
        (val) => val === null || val >= 0,
        { message: 'Max budget must be a positive number or zero' }
      ),
    }).refine(
      (data) => {
        if (data.budget !== null && data.maxBudget !== null) {
          return data.maxBudget >= data.budget;
        }
        return true;
      },
      {
        message: 'Maximum budget must be greater than or equal to minimum budget',
        path: ['maxBudget'],
      }
    ).parse({
      budget: typeof budget === 'string' ? parseFloat(budget) : budget,
      maxBudget: typeof maxBudget === 'string' ? parseFloat(maxBudget) : maxBudget,
    });
  };

  test('accepts valid budget ranges', () => {
    // Both values valid
    expect(createBudgetSchema(100000, 200000)).toEqual({ budget: 100000, maxBudget: 200000 });
    
    // Equal values are valid
    expect(createBudgetSchema(500000, 500000)).toEqual({ budget: 500000, maxBudget: 500000 });
    
    // Null values are valid
    expect(createBudgetSchema(null, 200000)).toEqual({ budget: null, maxBudget: 200000 });
    expect(createBudgetSchema(100000, null)).toEqual({ budget: 100000, maxBudget: null });
    expect(createBudgetSchema(null, null)).toEqual({ budget: null, maxBudget: null });
    
    // Zero values are valid
    expect(createBudgetSchema(0, 200000)).toEqual({ budget: 0, maxBudget: 200000 });
    expect(createBudgetSchema(0, 0)).toEqual({ budget: 0, maxBudget: 0 });
  });

  test('rejects invalid budget ranges', () => {
    // Max budget less than min budget should fail
    expect(() => createBudgetSchema(200000, 100000)).toThrow(
      'Maximum budget must be greater than or equal to minimum budget'
    );
    
    // Negative values should fail
    expect(() => createBudgetSchema(-100000, 200000)).toThrow(
      'Budget must be a positive number or zero'
    );
    
    expect(() => createBudgetSchema(100000, -200000)).toThrow(
      'Max budget must be a positive number or zero'
    );
  });

  test('handles string inputs correctly', () => {
    // String inputs should be converted to numbers
    expect(createBudgetSchema('100000', '200000')).toEqual({ budget: 100000, maxBudget: 200000 });
    
    // Invalid string inputs (non-numeric) should throw
    expect(() => createBudgetSchema('not-a-number', '200000')).toThrow();
    expect(() => createBudgetSchema('100000', 'not-a-number')).toThrow();
  });
});

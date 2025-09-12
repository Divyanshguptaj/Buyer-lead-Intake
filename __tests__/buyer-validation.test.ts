import { describe, it, expect } from '@jest/globals';
import { buyerSchema } from '../src/db/schema';

describe('Buyer Validation', () => {
  // Test budget validation logic
  describe('Budget Validation', () => {
    it('should pass when budgetMax is greater than budgetMin', () => {
      const validBuyer = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        budgetMin: 1000000,
        budgetMax: 2000000,
        timeline: '0-3m',
        source: 'Website',
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = buyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should pass when budgetMax equals budgetMin', () => {
      const validBuyer = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        budgetMin: 1000000,
        budgetMax: 1000000,
        timeline: '0-3m',
        source: 'Website',
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = buyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should fail when budgetMax is less than budgetMin', () => {
      const invalidBuyer = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        budgetMin: 2000000,
        budgetMax: 1000000, // This is less than budgetMin
        timeline: '0-3m',
        source: 'Website',
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        // Check that we got the correct error message
        const errors = result.error.flatten().fieldErrors;
        expect(errors.budgetMax).toBeDefined();
        expect(errors.budgetMax?.[0]).toContain('Maximum budget should be greater than or equal to minimum budget');
      }
    });

    it('should pass when only budgetMin is provided', () => {
      const validBuyer = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        budgetMin: 1000000,
        timeline: '0-3m',
        source: 'Website',
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = buyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should pass when only budgetMax is provided', () => {
      const validBuyer = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        budgetMax: 2000000,
        timeline: '0-3m',
        source: 'Website',
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = buyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });
  });

  // Test BHK conditional requirement
  describe('BHK Conditional Validation', () => {
    it('should require bhk when propertyType is Apartment', () => {
      const invalidBuyer = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        // bhk is missing
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.bhk).toBeDefined();
        expect(errors.bhk?.[0]).toContain('BHK is required for Apartment');
      }
    });

    it('should not require bhk when propertyType is Plot', () => {
      const validBuyer = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        // bhk is missing but that's okay for Plot
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = buyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });
  });
});

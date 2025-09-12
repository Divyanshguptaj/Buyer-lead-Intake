const { describe, it, expect } = require('@jest/globals');

// Simple test to verify the TagInput component exports correctly
describe('TagInput Component', () => {
  it('should be properly defined', () => {
    const { TagInput } = require('@/components/ui/tag-input');
    expect(typeof TagInput).toBe('function');
  });
});

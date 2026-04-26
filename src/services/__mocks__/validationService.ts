import { vi } from 'vitest';

const mockValidationService = {
  validateMermaidCode: vi.fn().mockReturnValue({
    isValid: true,
    errors: [],
  }),
  sanitizeCode: vi.fn().mockImplementation((code: string) => code),
  validateFileUpload: vi.fn().mockReturnValue({
    isValid: true,
  }),
  validateExportFilename: vi.fn().mockImplementation((filename: string) => filename),
  validateImageUrl: vi.fn().mockReturnValue({
    isValid: true,
  }),
};

export const validationService = mockValidationService;

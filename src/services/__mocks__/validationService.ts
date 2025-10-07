const mockValidationService = {
  validateMermaidCode: jest.fn().mockReturnValue({
    isValid: true,
    errors: [],
  }),
  sanitizeCode: jest.fn().mockImplementation((code: string) => code),
  validateFileUpload: jest.fn().mockReturnValue({
    isValid: true,
  }),
  validateExportFilename: jest.fn().mockImplementation((filename: string) => filename),
  validateImageUrl: jest.fn().mockReturnValue({
    isValid: true,
  }),
};

export const validationService = mockValidationService;

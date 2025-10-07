import { VALIDATION_CONFIG } from '../constants/diagram.constants';

class ValidationService {
  validateMermaidCode(code: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check code length
    if (code.length > VALIDATION_CONFIG.MAX_CODE_LENGTH) {
      errors.push(`Code exceeds maximum length of ${VALIDATION_CONFIG.MAX_CODE_LENGTH} characters`);
    }

    // Check for blocked patterns
    VALIDATION_CONFIG.BLOCKED_PATTERNS.forEach((pattern) => {
      if (pattern.test(code)) {
        errors.push(`Code contains potentially unsafe content: ${pattern.toString()}`);
      }
    });

    // Check URL count
    const urlMatches = code.match(/https?:\/\/[^\s]+/g) || [];
    if (urlMatches.length > VALIDATION_CONFIG.MAX_URLS) {
      errors.push(`Code contains too many URLs (max: ${VALIDATION_CONFIG.MAX_URLS})`);
    }

    // Check for valid diagram type
    const firstLine = code.trim().split('\n')[0];
    const hasValidType = VALIDATION_CONFIG.ALLOWED_DIAGRAM_TYPES.some((type) =>
      firstLine.toLowerCase().includes(type.toLowerCase())
    );

    if (!hasValidType) {
      errors.push('Code must start with a valid Mermaid diagram type');
    }

    // Check for balanced brackets
    const brackets = { '[': ']', '{': '}', '(': ')' };
    const stack: string[] = [];
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];

      // Handle strings
      if ((char === '"' || char === "'") && code[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
        continue;
      }

      if (inString) continue;

      // Check brackets
      if (Object.keys(brackets).includes(char)) {
        stack.push(char);
      } else if (Object.values(brackets).includes(char)) {
        const last = stack.pop();
        if (!last || brackets[last as keyof typeof brackets] !== char) {
          errors.push('Unbalanced brackets detected');
          break;
        }
      }
    }

    if (stack.length > 0) {
      errors.push('Unbalanced brackets detected');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  sanitizeCode(code: string): string {
    // Remove any script tags
    let sanitized = code.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    return sanitized;
  }

  validateFileUpload(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      return { isValid: false, error: 'File size exceeds 5MB limit' };
    }

    // Check file extension
    const validExtensions = ['.mmd', '.md', '.txt', '.mermaid'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${validExtensions.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  validateExportFilename(filename: string): string {
    // Remove any path separators
    let sanitized = filename.replace(/[/\\]/g, '');

    // Remove special characters except dots, dashes, and underscores
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '');

    // Ensure it's not empty
    if (!sanitized) {
      sanitized = 'diagram';
    }

    // Limit length
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
    }

    return sanitized;
  }

  validateImageUrl(url: string): { isValid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);

      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
      }

      // Check for localhost in production
      if (
        import.meta.env.MODE === 'production' &&
        (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1')
      ) {
        return { isValid: false, error: 'Localhost URLs are not allowed in production' };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }
}

export const validationService = new ValidationService();

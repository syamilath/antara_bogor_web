/**
 * Password validation utility
 * Enforces strong password requirements
 */

export function validatePassword(password) {
  const errors = [];
  
  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Maximum length (prevent DoS attacks)
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }
  
  // Must contain uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Must contain lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Must contain number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Must contain special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }
  
  // Common password patterns to avoid
  const commonPatterns = [
    /(.)\1{2,}/, // Three or more repeated characters
    /123456|654321|qwerty|password|admin|letmein/i, // Common passwords
    /^[a-zA-Z]+$/, // Only letters
    /^\d+$/, // Only numbers
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      if (pattern.source.includes('123456')) {
        errors.push('Password cannot contain common patterns like "123456", "qwerty", or "password"');
      } else if (pattern.source.includes('(.)\\1{2,}')) {
        errors.push('Password cannot contain three or more repeated characters');
      }
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

export function getPasswordRequirements() {
  return [
    'At least 8 characters long',
    'Contains at least one uppercase letter (A-Z)',
    'Contains at least one lowercase letter (a-z)', 
    'Contains at least one number (0-9)',
    'Contains at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
    'No common patterns like "123456", "qwerty", or repeated characters'
  ];
}
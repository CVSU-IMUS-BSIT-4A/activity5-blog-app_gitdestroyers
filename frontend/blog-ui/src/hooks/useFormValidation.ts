import { useState } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface UseFormValidationReturn {
  errors: FormErrors;
  validateField: (fieldName: string, value: string, rules: ValidationRule) => string | undefined;
  validateForm: (values: Record<string, string>, rules: ValidationRules) => FormErrors;
  setError: (fieldName: string, error: string) => void;
  clearError: (fieldName: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

/**
 * Hook for form validation with common validation rules
 * Provides reusable validation functions for forms across the application
 */
export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (fieldName: string, value: string, rules: ValidationRule): string | undefined => {
    // Required validation
    if (rules.required && !value.trim()) {
      return `${fieldName} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value.trim() && !rules.required) {
      return undefined;
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return `Please enter a valid ${fieldName}`;
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return undefined;
  };

  const validateForm = (values: Record<string, string>, rules: ValidationRules): FormErrors => {
    const newErrors: FormErrors = {};

    Object.keys(rules).forEach(fieldName => {
      const fieldRules = rules[fieldName];
      const value = values[fieldName] || '';
      const error = validateField(fieldName, value, fieldRules);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return newErrors;
  };

  const setError = (fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const clearError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    validateField,
    validateForm,
    setError,
    clearError,
    clearAllErrors,
    hasErrors,
  };
}



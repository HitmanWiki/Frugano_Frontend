import { VALIDATION } from './constants'

// Required field validator
export const required = (message = 'This field is required') => {
  return (value) => {
    if (value === undefined || value === null || value === '') {
      return message
    }
    return true
  }
}

// Email validator
export const email = (message = 'Invalid email address') => {
  return (value) => {
    if (!value) return true
    return VALIDATION.EMAIL_REGEX.test(value) ? true : message
  }
}

// Phone validator
export const phone = (message = 'Invalid phone number') => {
  return (value) => {
    if (!value) return true
    const cleaned = value.replace(/\D/g, '')
    return cleaned.length === 10 ? true : message
  }
}

// Min length validator
export const minLength = (length, message = `Must be at least ${length} characters`) => {
  return (value) => {
    if (!value) return true
    return value.length >= length ? true : message
  }
}

// Max length validator
export const maxLength = (length, message = `Must be no more than ${length} characters`) => {
  return (value) => {
    if (!value) return true
    return value.length <= length ? true : message
  }
}

// Min value validator
export const min = (min, message = `Must be at least ${min}`) => {
  return (value) => {
    if (value === undefined || value === null || value === '') return true
    return Number(value) >= min ? true : message
  }
}

// Max value validator
export const max = (max, message = `Must be no more than ${max}`) => {
  return (value) => {
    if (value === undefined || value === null || value === '') return true
    return Number(value) <= max ? true : message
  }
}

// Positive number validator
export const positive = (message = 'Must be a positive number') => {
  return (value) => {
    if (value === undefined || value === null || value === '') return true
    return Number(value) > 0 ? true : message
  }
}

// Integer validator
export const integer = (message = 'Must be a whole number') => {
  return (value) => {
    if (value === undefined || value === null || value === '') return true
    return Number.isInteger(Number(value)) ? true : message
  }
}

// Decimal validator
export const decimal = (message = 'Must be a valid decimal number') => {
  return (value) => {
    if (value === undefined || value === null || value === '') return true
    return !isNaN(parseFloat(value)) && isFinite(value) ? true : message
  }
}

// GST validator
export const gst = (message = 'Invalid GST number') => {
  return (value) => {
    if (!value) return true
    return VALIDATION.GST_REGEX.test(value) ? true : message
  }
}

// PAN validator
export const pan = (message = 'Invalid PAN number') => {
  return (value) => {
    if (!value) return true
    return VALIDATION.PAN_REGEX.test(value) ? true : message
  }
}

// Aadhaar validator
export const aadhaar = (message = 'Invalid Aadhaar number') => {
  return (value) => {
    if (!value) return true
    const cleaned = value.replace(/\D/g, '')
    return VALIDATION.AADHAAR_REGEX.test(cleaned) ? true : message
  }
}

// Pincode validator
export const pincode = (message = 'Invalid pincode') => {
  return (value) => {
    if (!value) return true
    return VALIDATION.PINCODE_REGEX.test(value) ? true : message
  }
}

// URL validator
export const url = (message = 'Invalid URL') => {
  return (value) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return message
    }
  }
}

// Password strength validator
export const passwordStrength = (message = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character') => {
  return (value) => {
    if (!value) return true
    
    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumbers = /\d/.test(value)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    
    return (hasUpperCase && hasLowerCase && hasNumbers && hasSpecial) ? true : message
  }
}

// Match validator (for confirm password)
export const match = (field, fieldName, message = `Must match ${fieldName}`) => {
  return (value, formValues) => {
    if (!value) return true
    return value === formValues[field] ? true : message
  }
}

// File type validator
export const fileType = (allowedTypes, message = 'Invalid file type') => {
  return (file) => {
    if (!file) return true
    return allowedTypes.includes(file.type) ? true : message
  }
}

// File size validator
export const fileSize = (maxSize, message = `File size must be less than ${maxSize / (1024 * 1024)}MB`) => {
  return (file) => {
    if (!file) return true
    return file.size <= maxSize ? true : message
  }
}

// Date validator
export const date = (message = 'Invalid date') => {
  return (value) => {
    if (!value) return true
    const date = new Date(value)
    return date instanceof Date && !isNaN(date) ? true : message
  }
}

// Min date validator
export const minDate = (min, message = `Date must be after ${min}`) => {
  return (value) => {
    if (!value) return true
    const date = new Date(value)
    const minDate = new Date(min)
    return date >= minDate ? true : message
  }
}

// Max date validator
export const maxDate = (max, message = `Date must be before ${max}`) => {
  return (value) => {
    if (!value) return true
    const date = new Date(value)
    const maxDate = new Date(max)
    return date <= maxDate ? true : message
  }
}

// Array validators
export const arrayMinLength = (length, message = `Must have at least ${length} items`) => {
  return (value) => {
    if (!value) return true
    return Array.isArray(value) && value.length >= length ? true : message
  }
}

export const arrayMaxLength = (length, message = `Must have no more than ${length} items`) => {
  return (value) => {
    if (!value) return true
    return Array.isArray(value) && value.length <= length ? true : message
  }
}

// Compose multiple validators
export const compose = (...validators) => {
  return (value, formValues) => {
    for (const validator of validators) {
      const result = validator(value, formValues)
      if (result !== true) {
        return result
      }
    }
    return true
  }
}

// Common validation rules
export const commonRules = {
  name: compose(
    required('Name is required'),
    minLength(2, 'Name must be at least 2 characters'),
    maxLength(50, 'Name must be no more than 50 characters')
  ),
  
  email: compose(
    required('Email is required'),
    email('Invalid email address')
  ),
  
  phone: compose(
    required('Phone number is required'),
    phone('Invalid phone number')
  ),
  
  password: compose(
    required('Password is required'),
    minLength(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
  ),
  
  price: compose(
    required('Price is required'),
    positive('Price must be positive'),
    decimal('Invalid price')
  ),
  
  quantity: compose(
    required('Quantity is required'),
    positive('Quantity must be positive'),
    integer('Quantity must be a whole number')
  ),
  
  discount: compose(
    min(0, 'Discount cannot be negative'),
    max(100, 'Discount cannot exceed 100%')
  ),
  
  percentage: compose(
    min(0, 'Percentage cannot be negative'),
    max(100, 'Percentage cannot exceed 100')
  ),
}

export default {
  required,
  email,
  phone,
  minLength,
  maxLength,
  min,
  max,
  positive,
  integer,
  decimal,
  gst,
  pan,
  aadhaar,
  pincode,
  url,
  passwordStrength,
  match,
  fileType,
  fileSize,
  date,
  minDate,
  maxDate,
  arrayMinLength,
  arrayMaxLength,
  compose,
  commonRules,
}
import { format, formatDistance, formatRelative, isToday, isYesterday, isThisWeek } from 'date-fns'
import { DATE_FORMATS, CURRENCY } from './constants'

// Currency formatting
export const formatCurrency = (amount, currency = CURRENCY.CODE, locale = CURRENCY.LOCALE) => {
  if (amount === null || amount === undefined) return `${CURRENCY.SYMBOL}0.00`
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatINR = (amount) => {
  return formatCurrency(amount, 'INR', 'en-IN')
}

export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '0'
  return number.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%'
  return `${value.toFixed(decimals)}%`
}

// Date formatting
export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY) => {
  if (!date) return 'N/A'
  return format(new Date(date), formatStr)
}

export const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), DATE_FORMATS.DISPLAY_TIME)
}

export const formatTimeAgo = (date) => {
  if (!date) return 'N/A'
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A'
  const dateObj = new Date(date)
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'hh:mm a')}`
  }
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'hh:mm a')}`
  }
  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE hh:mm a')
  }
  return format(dateObj, DATE_FORMATS.DISPLAY_TIME)
}

export const formatMonthYear = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), DATE_FORMATS.MONTH_YEAR)
}

export const formatYearMonth = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), DATE_FORMATS.YEAR_MONTH)
}

// Phone formatting
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`
  }
  if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  }
  return phone
}

export const formatCompactPhone = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{5})(\d{5})/, '$1-$2')
  }
  return phone
}

// Address formatting
export const formatAddress = (address) => {
  if (!address) return ''
  const parts = []
  
  if (address.addressLine1) parts.push(address.addressLine1)
  if (address.addressLine2) parts.push(address.addressLine2)
  if (address.landmark) parts.push(`near ${address.landmark}`)
  if (address.city) parts.push(address.city)
  if (address.state) parts.push(address.state)
  if (address.pincode) parts.push(address.pincode)
  
  return parts.join(', ')
}

// Name formatting
export const formatInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const formatFullName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(' ')
}

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Duration formatting
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`
}

// Stock status formatting
export const formatStockStatus = (current, minimum) => {
  if (current <= 0) {
    return { label: 'Out of Stock', color: 'text-red-600 bg-red-100' }
  }
  if (current <= minimum) {
    return { label: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' }
  }
  return { label: 'In Stock', color: 'text-green-600 bg-green-100' }
}

// Payment status formatting
export const formatPaymentStatus = (status) => {
  const statusMap = {
    PAID: { label: 'Paid', color: 'text-green-600 bg-green-100' },
    PENDING: { label: 'Pending', color: 'text-yellow-600 bg-yellow-100' },
    PARTIAL: { label: 'Partial', color: 'text-blue-600 bg-blue-100' },
    CANCELLED: { label: 'Cancelled', color: 'text-red-600 bg-red-100' },
    REFUNDED: { label: 'Refunded', color: 'text-purple-600 bg-purple-100' },
    FAILED: { label: 'Failed', color: 'text-red-600 bg-red-100' },
  }
  
  return statusMap[status] || { label: status, color: 'text-gray-600 bg-gray-100' }
}

// Order status formatting
export const formatOrderStatus = (status) => {
  const statusMap = {
    PENDING: { label: 'Pending', color: 'text-yellow-600 bg-yellow-100' },
    CONFIRMED: { label: 'Confirmed', color: 'text-blue-600 bg-blue-100' },
    PROCESSING: { label: 'Processing', color: 'text-purple-600 bg-purple-100' },
    PACKED: { label: 'Packed', color: 'text-indigo-600 bg-indigo-100' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'text-orange-600 bg-orange-100' },
    DELIVERED: { label: 'Delivered', color: 'text-green-600 bg-green-100' },
    CANCELLED: { label: 'Cancelled', color: 'text-red-600 bg-red-100' },
    RETURNED: { label: 'Returned', color: 'text-red-600 bg-red-100' },
    REFUNDED: { label: 'Refunded', color: 'text-purple-600 bg-purple-100' },
  }
  
  return statusMap[status] || { label: status, color: 'text-gray-600 bg-gray-100' }
}

// Unit formatting
export const formatUnit = (value, unit) => {
  const unitMap = {
    KG: 'kg',
    GRAM: 'g',
    PIECE: 'pc',
    DOZEN: 'doz',
    BUNDLE: 'bundle',
    PACKET: 'pkt',
  }
  
  return `${value} ${unitMap[unit] || unit}`
}

// Percentage change formatting
export const formatPercentageChange = (current, previous) => {
  if (!previous || previous === 0) return { value: 0, trend: 'neutral' }
  
  const change = ((current - previous) / previous) * 100
  const formatted = Math.abs(change).toFixed(1)
  
  return {
    value: formatted,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    sign: change > 0 ? '+' : change < 0 ? '-' : '',
  }
}

// Mask sensitive data
export const maskData = (data, type) => {
  if (!data) return ''
  
  switch (type) {
    case 'phone':
      return data.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2')
    
    case 'email':
      const [local, domain] = data.split('@')
      const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1)
      return `${maskedLocal}@${domain}`
    
    case 'aadhaar':
      return data.replace(/\d{4}/g, '****')
    
    case 'pan':
      return data.replace(/([A-Z]{5})\d{4}([A-Z])/, '$1****$2')
    
    case 'card':
      return data.replace(/\d{4}-\d{4}-\d{4}-(\d{4})/, '****-****-****-$1')
    
    default:
      return data
  }
}

// Truncate text
export const truncateText = (text, length = 50, suffix = '...') => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length).trim() + suffix
}
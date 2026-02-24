// User Roles
export const USER_ROLES = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  INVENTORY_STAFF: 'INVENTORY_STAFF',
  DELIVERY_BOY: 'DELIVERY_BOY',
}

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  UPI: 'UPI',
  CARD: 'CARD',
  ONLINE: 'ONLINE',
  WALLET: 'WALLET',
  CREDIT: 'CREDIT',
  SPLIT: 'SPLIT',
}

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
}

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  PACKED: 'PACKED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
  REFUNDED: 'REFUNDED',
}

// Units of Measurement
export const UNITS = {
  KG: 'KG',
  GRAM: 'GRAM',
  PIECE: 'PIECE',
  DOZEN: 'DOZEN',
  BUNDLE: 'BUNDLE',
  PACKET: 'PACKET',
}

// Campaign Types
export const CAMPAIGN_TYPES = {
  FLASH_SALE: 'FLASH_SALE',
  SEASONAL_OFFER: 'SEASONAL_OFFER',
  FESTIVAL_OFFER: 'FESTIVAL_OFFER',
  BUNDLE_OFFER: 'BUNDLE_OFFER',
  FIRST_ORDER: 'FIRST_ORDER',
  REFERRAL: 'REFERRAL',
  LOYALTY_REWARD: 'LOYALTY_REWARD',
  WEEKEND_SPECIAL: 'WEEKEND_SPECIAL',
  CLEARANCE_SALE: 'CLEARANCE_SALE',
}

// Discount Types
export const DISCOUNT_TYPES = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  BUY_X_GET_Y: 'BUY_X_GET_Y',
  FREE_SHIPPING: 'FREE_SHIPPING',
  BOGO: 'BOGO',
}

// Target Types
export const TARGET_TYPES = {
  ALL_CUSTOMERS: 'ALL_CUSTOMERS',
  NEW_CUSTOMERS: 'NEW_CUSTOMERS',
  EXISTING_CUSTOMERS: 'EXISTING_CUSTOMERS',
  VIP_CUSTOMERS: 'VIP_CUSTOMERS',
  LOCATION_BASED: 'LOCATION_BASED',
}

// Address Types
export const ADDRESS_TYPES = {
  HOME: 'HOME',
  OFFICE: 'OFFICE',
  OTHER: 'OTHER',
}

// Delivery Status
export const DELIVERY_STATUS = {
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  RETURNED: 'RETURNED',
}

// Transaction Types
export const TRANSACTION_TYPES = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  ADJUSTMENT: 'ADJUSTMENT',
  WASTAGE: 'WASTAGE',
  RETURN: 'RETURN',
  TRANSFER: 'TRANSFER',
}

// Wastage Reasons
export const WASTAGE_REASONS = {
  SPOILED: 'SPOILED',
  DAMAGED: 'DAMAGED',
  EXPIRED: 'EXPIRED',
  OTHER: 'OTHER',
}

// Alert Status
export const ALERT_STATUS = {
  ACTIVE: 'ACTIVE',
  RESOLVED: 'RESOLVED',
  IGNORED: 'IGNORED',
}

// Feedback Categories
export const FEEDBACK_CATEGORIES = {
  PRODUCT_QUALITY: 'PRODUCT_QUALITY',
  DELIVERY: 'DELIVERY',
  PACKAGING: 'PACKAGING',
  PRICE: 'PRICE',
  SERVICE: 'SERVICE',
  OTHER: 'OTHER',
}

// Hardware Device Types
export const DEVICE_TYPES = {
  THERMAL_PRINTER: 'THERMAL_PRINTER',
  WEIGHING_MACHINE: 'WEIGHING_MACHINE',
  BARCODE_SCANNER: 'BARCODE_SCANNER',
  CASH_DRAWER: 'CASH_DRAWER',
}

// Connection Types
export const CONNECTION_TYPES = {
  USB: 'USB',
  SERIAL: 'SERIAL',
  NETWORK: 'NETWORK',
  BLUETOOTH: 'BLUETOOTH',
}

// Print Job Types
export const PRINT_JOB_TYPES = {
  BILL_RECEIPT: 'BILL_RECEIPT',
  INVOICE: 'INVOICE',
  LABEL: 'LABEL',
  REPORT: 'REPORT',
  TEST_PAGE: 'TEST_PAGE',
}

// Print Status
export const PRINT_STATUS = {
  PENDING: 'PENDING',
  PRINTING: 'PRINTING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
}

// API Routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    SETUP: '/auth/setup',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USERS: '/users',
  CATEGORIES: '/categories',
  PRODUCTS: '/products',
  SALES: '/sales',
  PURCHASES: '/purchases',
  SUPPLIERS: '/suppliers',
  INVENTORY: '/inventory',
  CUSTOMERS: '/customers',
  DASHBOARD: '/dashboard',
  CAMPAIGNS: '/campaigns',
  REPORTS: '/reports',
  HARDWARE: '/hardware',
  SETTINGS: '/settings',
}

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  DARK_MODE: 'darkMode',
  CART: 'cart',
  THEME: 'theme',
}

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_TIME: 'dd/MM/yyyy hh:mm a',
  API: 'yyyy-MM-dd',
  API_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  MONTH_YEAR: 'MMMM yyyy',
  YEAR_MONTH: 'yyyy-MM',
  TIME: 'hh:mm a',
}

// Currency
export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  LOCALE: 'en-IN',
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [10, 20, 50, 100],
}

// Chart Colors
export const CHART_COLORS = [
  '#1B4D3E',
  '#FFA500',
  '#FF4F4F',
  '#B1D8B7',
  '#65B065',
  '#8FC98F',
  '#4A90E2',
  '#F5A623',
  '#7ED321',
  '#9013FE',
]

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Welcome back!',
    LOGOUT: 'Logged out successfully',
    CREATE: 'Created successfully',
    UPDATE: 'Updated successfully',
    DELETE: 'Deleted successfully',
  },
  ERROR: {
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please login to continue',
    FORBIDDEN: 'You do not have permission to perform this action',
    NOT_FOUND: 'Resource not found',
    SERVER: 'Server error. Please try again later.',
  },
  WARNING: {
    UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
    DELETE_CONFIRM: 'Are you sure you want to delete this item?',
  },
}

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^[0-9]{10}$/,
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  GST_REGEX: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  PINCODE_REGEX: /^[1-9][0-9]{5}$/,
  AADHAAR_REGEX: /^[2-9]{1}[0-9]{11}$/,
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
}

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  ALLOWED_EXCEL_TYPES: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
}

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
}

// Default Store Settings
export const DEFAULT_STORE_SETTINGS = {
  storeName: 'Frugano Store',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  taxRate: 5,
  deliveryFee: 40,
  freeDeliveryMin: 500,
  loyaltyPointsRate: 1,
  openingTime: '09:00',
  closingTime: '21:00',
  invoicePrefix: 'INV-',
  invoiceStartNumber: 1001,
  invoiceFooter: 'Thank you for shopping!',
  autoPrintInvoice: true,
  emailInvoice: false,
}

// Dashboard Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 60000, // 1 minute
  INVENTORY: 300000, // 5 minutes
  SALES: 60000, // 1 minute
  NOTIFICATIONS: 30000, // 30 seconds
}
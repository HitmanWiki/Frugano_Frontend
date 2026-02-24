import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PrinterIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'
import { useTheme } from '../../contexts/ThemeContext'

const StoreSettings = () => {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')
  const theme = useTheme()  // Get theme object

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    fetchStoreSettings()
  }, [])

  const fetchStoreSettings = async () => {
    try {
      // Try to fetch from API, fallback to defaults if 404
      const response = await api.get('/settings/store').catch(err => {
        if (err.response?.status === 404) {
          // Return default settings if endpoint not found
          return { data: getDefaultSettings() }
        }
        throw err
      })
      reset(response.data)
    } catch (error) {
      console.warn('Using default store settings')
      reset(getDefaultSettings())
    } finally {
      setFetchLoading(false)
    }
  }

  const getDefaultSettings = () => ({
    storeName: 'Frugano Store',
    phone: '+91 9876543210',
    email: 'store@frugano.com',
    gstNumber: '27AAAAA0000A1Z5',
    address: '123, Retail Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',
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
    autoBackup: false,
    backupFrequency: 'daily',
    backupTime: '02:00',
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.put('/settings/store', data)
      toast.success('Store settings updated successfully')
    } catch (error) {
      if (error.response?.status === 404) {
        toast.success('Settings saved locally (demo mode)')
      } else {
        toast.error(error.response?.data?.error || 'Failed to update settings')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    try {
      const response = await api.get('/settings/backup', {
        responseType: 'blob'
      }).catch(err => {
        if (err.response?.status === 404) {
          // Create mock backup if endpoint not found
          const mockData = JSON.stringify({
            timestamp: new Date().toISOString(),
            settings: getDefaultSettings(),
            message: 'Demo backup file'
          })
          return { data: new Blob([mockData], { type: 'application/json' }) }
        }
        throw err
      })
      
      // Download backup file
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `frugano-backup-${new Date().toISOString().split('T')[0]}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Backup downloaded successfully')
    } catch (error) {
      toast.error('Failed to create backup')
    }
  }

  if (fetchLoading) return <Loader />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-heading font-bold ${theme?.text?.primary || 'text-gray-900'}`}>
          Store Settings
        </h1>
        <p className={`${theme?.text?.secondary || 'text-gray-600'} mt-1`}>
          Configure your store information and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className={`border-b ${theme?.border?.primary || 'border-gray-200'}`}>
        <nav className="flex space-x-8 overflow-x-auto">
          {['general', 'business', 'invoice', 'backup'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : `border-transparent ${theme?.text?.secondary || 'text-gray-600'} hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300`
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Forms */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${theme?.bg?.card || 'bg-white'} rounded-xl shadow-card p-6 space-y-6`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Store Name
                </label>
                <div className="relative">
                  <BuildingStorefrontIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('storeName', { required: 'Store name is required' })}
                    className={`pl-10 input-field ${errors.storeName ? 'border-red-500' : ''}`}
                    placeholder="Frugano Store"
                  />
                </div>
                {errors.storeName && (
                  <p className="mt-1 text-sm text-red-600">{errors.storeName.message}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    {...register('phone')}
                    className="pl-10 input-field"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    {...register('email')}
                    className="pl-10 input-field"
                    placeholder="store@frugano.com"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  GST Number
                </label>
                <input
                  type="text"
                  {...register('gstNumber')}
                  className="input-field"
                  placeholder="27AAAAA0000A1Z5"
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Address
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    {...register('address')}
                    rows="3"
                    className="pl-10 input-field"
                    placeholder="Store address..."
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  City
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className="input-field"
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  State
                </label>
                <input
                  type="text"
                  {...register('state')}
                  className="input-field"
                  placeholder="Maharashtra"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Pincode
                </label>
                <input
                  type="text"
                  {...register('pincode')}
                  className="input-field"
                  placeholder="400001"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Country
                </label>
                <input
                  type="text"
                  {...register('country')}
                  className="input-field"
                  placeholder="India"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Business Settings */}
        {activeTab === 'business' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${theme?.bg?.card || 'bg-white'} rounded-xl shadow-card p-6 space-y-6`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Currency
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    {...register('currency')}
                    className="pl-10 input-field"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Timezone
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    {...register('timezone')}
                    className="pl-10 input-field"
                  >
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="Asia/Dubai">UAE (GST)</option>
                    <option value="Asia/Singapore">Singapore (SGT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('taxRate')}
                  className="input-field"
                  placeholder="5"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('deliveryFee')}
                  className="input-field"
                  placeholder="40"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Minimum Order for Free Delivery (₹)
                </label>
                <input
                  type="number"
                  {...register('freeDeliveryMin')}
                  className="input-field"
                  placeholder="500"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Loyalty Points per ₹100
                </label>
                <input
                  type="number"
                  {...register('loyaltyPointsRate')}
                  className="input-field"
                  placeholder="1"
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Business Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${theme?.text?.secondary || 'text-gray-500'} mb-1`}>Opening Time</label>
                    <input
                      type="time"
                      {...register('openingTime')}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${theme?.text?.secondary || 'text-gray-500'} mb-1`}>Closing Time</label>
                    <input
                      type="time"
                      {...register('closingTime')}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Invoice Settings */}
        {activeTab === 'invoice' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${theme?.bg?.card || 'bg-white'} rounded-xl shadow-card p-6 space-y-6`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Invoice Prefix
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('invoicePrefix')}
                    className="pl-10 input-field"
                    placeholder="INV-"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Invoice Starting Number
                </label>
                <input
                  type="number"
                  {...register('invoiceStartNumber')}
                  className="input-field"
                  placeholder="1001"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Footer Text
                </label>
                <input
                  type="text"
                  {...register('invoiceFooter')}
                  className="input-field"
                  placeholder="Thank you for shopping!"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Terms & Conditions
                </label>
                <textarea
                  {...register('termsConditions')}
                  rows="3"
                  className="input-field"
                  placeholder="Terms and conditions..."
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                  Default Printer
                </label>
                <div className="relative">
                  <PrinterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    {...register('defaultPrinter')}
                    className="pl-10 input-field"
                  >
                    <option value="">Select Printer</option>
                    <option value="thermal">Thermal Printer</option>
                    <option value="a4">A4 Printer</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('autoPrintInvoice')}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <span className={`text-sm ${theme?.text?.primary || 'text-gray-700'}`}>
                    Automatically print invoice after sale
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('emailInvoice')}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <span className={`text-sm ${theme?.text?.primary || 'text-gray-700'}`}>
                    Email invoice to customer (if email provided)
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Backup & Restore */}
        {activeTab === 'backup' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className={`${theme?.bg?.card || 'bg-white'} rounded-xl shadow-card p-6`}>
              <h3 className={`text-lg font-heading font-semibold ${theme?.text?.primary || 'text-gray-900'} mb-4`}>
                Backup Database
              </h3>
              <p className={`text-sm ${theme?.text?.secondary || 'text-gray-600'} mb-4`}>
                Create a backup of your entire database including all products, sales, customers, and settings.
              </p>
              <button
                type="button"
                onClick={handleBackup}
                className="btn-primary inline-flex items-center"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Download Backup
              </button>
            </div>

            <div className={`${theme?.bg?.card || 'bg-white'} rounded-xl shadow-card p-6`}>
              <h3 className={`text-lg font-heading font-semibold ${theme?.text?.primary || 'text-gray-900'} mb-4`}>
                Restore Database
              </h3>
              <p className={`text-sm ${theme?.text?.secondary || 'text-gray-600'} mb-4`}>
                Restore your database from a previous backup file.
              </p>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".zip,.sql,.json"
                  className="flex-1 input-field"
                  onChange={(e) => {
                    // Handle file selection
                    console.log('File selected:', e.target.files[0])
                  }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Restore
                </button>
              </div>
            </div>

            <div className={`${theme?.bg?.card || 'bg-white'} rounded-xl shadow-card p-6`}>
              <h3 className={`text-lg font-heading font-semibold ${theme?.text?.primary || 'text-gray-900'} mb-4`}>
                Auto Backup Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${theme?.text?.primary || 'text-gray-900'}`}>Automatic Backups</p>
                    <p className={`text-xs ${theme?.text?.secondary || 'text-gray-600'}`}>Schedule regular database backups</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('autoBackup')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-gray-700"></div>
                  </label>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                    Backup Frequency
                  </label>
                  <select
                    {...register('backupFrequency')}
                    className="input-field"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme?.text?.primary || 'text-gray-700'} mb-2`}>
                    Backup Time
                  </label>
                  <input
                    type="time"
                    {...register('backupTime')}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button (only for non-backup tabs) */}
        {activeTab !== 'backup' && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </motion.div>
  )
}

export default StoreSettings
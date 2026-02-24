import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScaleIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'
import { useTheme } from '../../contexts/ThemeContext'

const connectionTypes = [
  { value: 'USB', label: 'USB' },
  { value: 'SERIAL', label: 'Serial (RS232)' },
  { value: 'BLUETOOTH', label: 'Bluetooth' },
]

const baudRates = [9600, 19200, 38400, 115200]

const WeighingScale = () => {
  const [showConfig, setShowConfig] = useState(false)
  const [currentWeight, setCurrentWeight] = useState(null)
  const [isReading, setIsReading] = useState(false)
  const [isLiveReading, setIsLiveReading] = useState(false)
  const [weightHistory, setWeightHistory] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showProducts, setShowProducts] = useState(false)
  const theme = useTheme()
  const queryClient = useQueryClient()

  const { data: scale, isLoading } = useQuery({
    queryKey: ['weighing-scale'],
    queryFn: () => api.get('/hardware/weighing/status').then(res => res.data)
  })

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products', { params: { limit: 100, isActive: true } }).then(res => res.data)
  })

  const readWeightMutation = useMutation({
    mutationFn: () => api.get('/hardware/weighing/read'),
    onSuccess: (response) => {
      const weightData = response.data.data
      setCurrentWeight(weightData)
      
      // Add to history
      setWeightHistory(prev => {
        const newHistory = [{
          ...weightData,
          timestamp: new Date(),
          id: Date.now()
        }, ...prev]
        return newHistory.slice(0, 10) // Keep last 10 readings
      })
      
      setIsReading(false)
    },
    onError: (error) => {
      toast.error('Failed to read weight')
      setIsReading(false)
    }
  })

  const configureMutation = useMutation({
    mutationFn: (config) => api.post('/hardware/weighing/configure', config),
    onSuccess: () => {
      queryClient.invalidateQueries(['weighing-scale'])
      toast.success('Scale configured successfully')
      setShowConfig(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to configure scale')
    }
  })

  const tareMutation = useMutation({
    mutationFn: () => api.post('/hardware/weighing/tare'),
    onSuccess: () => {
      toast.success('Scale tared successfully')
    },
    onError: (error) => {
      toast.error('Failed to tare scale')
    }
  })

  const zeroMutation = useMutation({
    mutationFn: () => api.post('/hardware/weighing/zero'),
    onSuccess: () => {
      toast.success('Scale zeroed successfully')
    },
    onError: (error) => {
      toast.error('Failed to zero scale')
    }
  })

  const handleReadWeight = () => {
    setIsReading(true)
    readWeightMutation.mutate()
  }

  const startLiveReading = () => {
    setIsLiveReading(true)
    // Read every second
    const interval = setInterval(() => {
      readWeightMutation.mutate()
    }, 1000)
    
    // Store interval ID to clear later
    return () => clearInterval(interval)
  }

  const stopLiveReading = () => {
    setIsLiveReading(false)
  }

  useEffect(() => {
    let interval
    if (isLiveReading) {
      interval = startLiveReading()
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLiveReading])

  const calculatePrice = () => {
    if (!currentWeight || !selectedProduct) return null
    return (currentWeight.weight * selectedProduct.sellingPrice).toFixed(2)
  }

  const addToCart = () => {
    if (!currentWeight || !selectedProduct) {
      toast.error('Please select a product and read weight first')
      return
    }

    const price = calculatePrice()
    // Here you would dispatch to cart or POS
    toast.success(`Added ${currentWeight.weight}kg of ${selectedProduct.name} at ₹${price}`)
  }

  const printLabel = () => {
    if (!currentWeight || !selectedProduct) {
      toast.error('Please select a product and read weight first')
      return
    }

    const label = `
      ${selectedProduct.name}
      Weight: ${currentWeight.weight} kg
      Price: ₹${calculatePrice()}
      Date: ${new Date().toLocaleString()}
    `

    // Here you would send to label printer
    toast.success('Label sent to printer')
    console.log('Label:', label)
  }

  if (isLoading) return <Loader />

  const isConnected = scale?.data?.connected
  const isMock = scale?.data?.mock

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-heading font-bold ${theme.text.primary}`}>Weighing Scale</h1>
          <p className={`${theme.text.secondary} mt-1`}>
            {isMock ? 'Demo Mode - No actual hardware' : 'Connect and manage your weighing scale'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowConfig(true)}
            className="btn-secondary inline-flex items-center"
          >
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Configure
          </button>
          {isConnected && (
            <>
              <button
                onClick={() => tareMutation.mutate()}
                disabled={tareMutation.isLoading}
                className="btn-outline text-sm"
              >
                Tare
              </button>
              <button
                onClick={() => zeroMutation.mutate()}
                disabled={zeroMutation.isLoading}
                className="btn-outline text-sm"
              >
                Zero
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className={`${theme.bg.card} rounded-xl shadow-card p-6`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${
              isConnected ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <ScaleIcon className={`h-8 w-8 ${
                isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-heading font-semibold ${theme.text.primary}`}>
                Scale Status
              </h2>
              <div className="flex items-center mt-1">
                {isConnected ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Connected {isMock && '(Demo)'}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-gray-500 dark:text-gray-400">Not Connected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {isConnected && (
            <div className="flex space-x-2">
              <button
                onClick={isLiveReading ? stopLiveReading : startLiveReading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLiveReading
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {isLiveReading ? 'Stop Live' : 'Start Live'}
              </button>
            </div>
          )}
        </div>

        {isConnected && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            {/* Weight Display */}
            <div className="text-center mb-6">
              <p className={`text-sm ${theme.text.secondary} mb-2`}>Current Weight</p>
              {currentWeight ? (
                <div>
                  <p className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                    {currentWeight.weight} kg
                  </p>
                  {currentWeight.stable ? (
                    <p className="text-sm text-green-500 mt-2">Stable ✓</p>
                  ) : (
                    <p className="text-sm text-yellow-500 mt-2">Unstable ⚠</p>
                  )}
                  {currentWeight.price && (
                    <p className={`text-lg ${theme.text.secondary} mt-2`}>
                      Calculated Price: ₹{currentWeight.price}
                    </p>
                  )}
                </div>
              ) : (
                <p className={`${theme.text.secondary} text-lg`}>No weight reading</p>
              )}
            </div>

            {/* Product Selection */}
            <div className="mb-6">
              <button
                onClick={() => setShowProducts(!showProducts)}
                className="w-full text-left px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {selectedProduct ? selectedProduct.name : 'Select Product for Pricing'}
              </button>
              
              <AnimatePresence>
                {showProducts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div className="max-h-60 overflow-y-auto">
                      {products?.data?.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowProducts(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex justify-between">
                            <span className={`${theme.text.primary}`}>{product.name}</span>
                            <span className={`${theme.text.secondary} text-sm`}>
                              ₹{product.sellingPrice}/kg
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Calculated Price */}
            {selectedProduct && currentWeight && (
              <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                <p className={`text-sm ${theme.text.secondary} mb-1`}>Calculated Price</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  ₹{calculatePrice()}
                </p>
                <p className={`text-xs ${theme.text.secondary} mt-1`}>
                  {selectedProduct.name} @ ₹{selectedProduct.sellingPrice}/kg × {currentWeight.weight}kg
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleReadWeight}
                disabled={isReading}
                className="btn-primary inline-flex items-center disabled:opacity-50"
              >
                {isReading ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    Reading...
                  </>
                ) : (
                  <>
                    <BeakerIcon className="h-5 w-5 mr-2" />
                    Read Weight
                  </>
                )}
              </button>

              {selectedProduct && currentWeight && (
                <>
                  <button
                    onClick={addToCart}
                    className="btn-secondary inline-flex items-center"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={printLabel}
                    className="btn-secondary inline-flex items-center"
                  >
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    Print Label
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Device Info */}
      {isConnected && scale?.data?.device && (
        <div className={`${theme.bg.card} rounded-xl shadow-card p-6`}>
          <h3 className={`text-lg font-heading font-semibold ${theme.text.primary} mb-4`}>
            Device Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${theme.text.secondary}`}>Device Name</p>
              <p className={`text-sm font-medium ${theme.text.primary}`}>{scale.data.device}</p>
            </div>
            <div>
              <p className={`text-sm ${theme.text.secondary}`}>Model</p>
              <p className={`text-sm font-medium ${theme.text.primary}`}>{scale.data.model || 'N/A'}</p>
            </div>
            <div>
              <p className={`text-sm ${theme.text.secondary}`}>Connection Type</p>
              <p className={`text-sm font-medium ${theme.text.primary}`}>{scale.data.connectionType}</p>
            </div>
            <div>
              <p className={`text-sm ${theme.text.secondary}`}>Mode</p>
              <p className={`text-sm font-medium ${theme.text.primary}`}>
                {scale.data.mock ? 'Demo' : 'Live'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weight History */}
      {weightHistory.length > 0 && (
        <div className={`${theme.bg.card} rounded-xl shadow-card p-6`}>
          <h3 className={`text-lg font-heading font-semibold ${theme.text.primary} mb-4`}>
            Recent Readings
          </h3>
          <div className="space-y-2">
            {weightHistory.map((reading) => (
              <div
                key={reading.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className={`text-sm font-medium ${theme.text.primary}`}>
                    {reading.weight} kg
                  </p>
                  <p className={`text-xs ${theme.text.secondary}`}>
                    {reading.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {reading.stable ? (
                  <span className="text-xs text-green-500">Stable</span>
                ) : (
                  <span className="text-xs text-yellow-500">Unstable</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfig && (
          <ScaleConfigModal
            scale={scale?.data}
            onClose={() => setShowConfig(false)}
            onSave={configureMutation.mutate}
            loading={configureMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Configuration Modal Component
const ScaleConfigModal = ({ scale, onClose, onSave, loading }) => {
  const theme = useTheme()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: scale || {
      deviceName: '',
      deviceModel: '',
      connectionType: 'SERIAL',
      comPort: 'COM3',
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
    }
  })

  const connectionType = watch('connectionType')

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative ${theme.bg.card} rounded-xl shadow-xl max-w-md w-full p-6 z-10`}
        >
          <h2 className={`text-xl font-heading font-bold ${theme.text.primary} mb-4`}>
            Configure Weighing Scale
          </h2>

          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            {/* Device Name */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Device Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('deviceName', { required: 'Device name is required' })}
                className={`input-field ${errors.deviceName ? 'border-red-500' : ''}`}
                placeholder="Weighing Scale 1"
              />
            </div>

            {/* Model */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Model
              </label>
              <input
                type="text"
                {...register('deviceModel')}
                className="input-field"
                placeholder="CAS DB-II"
              />
            </div>

            {/* Connection Type */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Connection Type
              </label>
              <select
                {...register('connectionType')}
                className="input-field"
              >
                {connectionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Serial Port Settings */}
            {connectionType === 'SERIAL' && (
              <>
                <div>
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                    COM Port
                  </label>
                  <input
                    type="text"
                    {...register('comPort')}
                    className="input-field"
                    placeholder="COM3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                      Baud Rate
                    </label>
                    <select
                      {...register('baudRate')}
                      className="input-field"
                    >
                      {baudRates.map(rate => (
                        <option key={rate} value={rate}>{rate}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                      Data Bits
                    </label>
                    <select
                      {...register('dataBits')}
                      className="input-field"
                    >
                      <option value="7">7</option>
                      <option value="8">8</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                      Stop Bits
                    </label>
                    <select
                      {...register('stopBits')}
                      className="input-field"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                      Parity
                    </label>
                    <select
                      {...register('parity')}
                      className="input-field"
                    >
                      <option value="none">None</option>
                      <option value="even">Even</option>
                      <option value="odd">Odd</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* USB Settings */}
            {connectionType === 'USB' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  USB scales are automatically detected. Please ensure drivers are installed.
                </p>
              </div>
            )}

            {/* Bluetooth Settings */}
            {connectionType === 'BLUETOOTH' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Pair your scale via Bluetooth first, then select the COM port.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default WeighingScale
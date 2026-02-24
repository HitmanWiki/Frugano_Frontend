import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ScaleIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'

const connectionTypes = [
  { value: 'USB', label: 'USB' },
  { value: 'SERIAL', label: 'Serial (RS232)' },
  { value: 'BLUETOOTH', label: 'Bluetooth' },
]

const WeighingScale = () => {
  const [showConfig, setShowConfig] = useState(false)
  const [currentWeight, setCurrentWeight] = useState(null)
  const [isReading, setIsReading] = useState(false)
  const queryClient = useQueryClient()

  const { data: scale, isLoading } = useQuery({
    queryKey: ['weighing-scale'],
    queryFn: () => api.get('/hardware/weighing/status').then(res => res.data)
  })

  const readWeightMutation = useMutation({
    mutationFn: () => api.get('/hardware/weighing/read'),
    onSuccess: (response) => {
      setCurrentWeight(response.data.data)
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

  const handleReadWeight = () => {
    setIsReading(true)
    readWeightMutation.mutate()
  }

  const startLiveReading = () => {
    // Start live weight reading (would use WebSocket in production)
    const interval = setInterval(() => {
      readWeightMutation.mutate()
    }, 1000)
    
    setTimeout(() => {
      clearInterval(interval)
    }, 30000) // Stop after 30 seconds
  }

  if (isLoading) return <Loader />

  const isConnected = scale?.data?.connected

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Weighing Scale</h1>
          <p className="text-gray-600 mt-1">Connect and manage your weighing scale</p>
        </div>
        
        <button
          onClick={() => setShowConfig(true)}
          className="btn-secondary inline-flex items-center"
        >
          <Cog6ToothIcon className="h-5 w-5 mr-2" />
          Configure Scale
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${
              isConnected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <ScaleIcon className={`h-8 w-8 ${
                isConnected ? 'text-green-600' : 'text-gray-600'
              }`} />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-gray-900">
                Scale Status
              </h2>
              <div className="flex items-center mt-1">
                {isConnected ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-600 font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-500">Not Connected</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {isConnected && (
          <div className="border-t pt-6">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 mb-2">Current Weight</p>
              {currentWeight ? (
                <div>
                  <p className="text-4xl font-bold text-primary-600">
                    {currentWeight.weight} kg
                  </p>
                  {currentWeight.price && (
                    <p className="text-lg text-gray-600 mt-2">
                      Price: ₹{currentWeight.price}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {currentWeight.stable ? 'Stable' : 'Unstable'}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">No weight reading</p>
              )}
            </div>

            <div className="flex justify-center space-x-4">
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
              <button
                onClick={startLiveReading}
                className="btn-secondary"
              >
                Start Live Reading
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Device Info */}
      {isConnected && scale?.data?.device && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
            Device Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Device Name</p>
              <p className="text-sm font-medium text-gray-900">{scale.data.device}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <p className="text-sm font-medium text-gray-900">{scale.data.model || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Connection Type</p>
              <p className="text-sm font-medium text-gray-900">{scale.data.connectionType}</p>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfig && (
        <ScaleConfigModal
          scale={scale?.data}
          onClose={() => setShowConfig(false)}
          onSave={configureMutation.mutate}
          loading={configureMutation.isLoading}
        />
      )}
    </motion.div>
  )
}

// Configuration Modal Component
const ScaleConfigModal = ({ scale, onClose, onSave, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: scale || {
      deviceName: '',
      deviceModel: '',
      connectionType: 'USB',
      comPort: '',
      baudRate: 9600,
    }
  })

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10"
        >
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
            Configure Weighing Scale
          </h2>

          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('deviceName', { required: 'Device name is required' })}
                className={`input-field ${errors.deviceName ? 'border-red-500' : ''}`}
                placeholder="Weighing Scale 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                {...register('deviceModel')}
                className="input-field"
                placeholder="CAS DB-II"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                COM Port
              </label>
              <input
                type="text"
                {...register('comPort')}
                className="input-field"
                placeholder="COM3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baud Rate
              </label>
              <select
                {...register('baudRate')}
                className="input-field"
              >
                <option value="9600">9600</option>
                <option value="19200">19200</option>
                <option value="38400">38400</option>
                <option value="115200">115200</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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
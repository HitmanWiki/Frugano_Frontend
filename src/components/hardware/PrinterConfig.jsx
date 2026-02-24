import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PrinterIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'

const connectionTypes = [
  { value: 'USB', label: 'USB' },
  { value: 'NETWORK', label: 'Network (Ethernet/WiFi)' },
  { value: 'BLUETOOTH', label: 'Bluetooth' },
]

const PrinterConfig = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingPrinter, setEditingPrinter] = useState(null)
  const [testingPrinter, setTestingPrinter] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['printers'],
    queryFn: () => api.get('/hardware/printers').then(res => res.data)
  })

  const createMutation = useMutation({
    mutationFn: (printerData) => api.post('/hardware/printers', printerData),
    onSuccess: () => {
      queryClient.invalidateQueries(['printers'])
      toast.success('Printer configured successfully')
      setShowForm(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to configure printer')
    }
  })

  const testPrinterMutation = useMutation({
    mutationFn: (id) => api.post(`/hardware/printers/${id}/test`),
    onSuccess: () => {
      toast.success('Test print job sent successfully')
      setTestingPrinter(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to test printer')
      setTestingPrinter(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/hardware/printers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['printers'])
      toast.success('Printer deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete printer')
    }
  })

  const handleTestPrinter = (id) => {
    setTestingPrinter(id)
    testPrinterMutation.mutate(id)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this printer?')) return
    deleteMutation.mutate(id)
  }

  if (isLoading) return <Loader />

  const printers = data?.data || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Printer Configuration</h1>
          <p className="text-gray-600 mt-1">Manage thermal printers for receipts and labels</p>
        </div>
        
        <button
          onClick={() => {
            setEditingPrinter(null)
            setShowForm(true)
          }}
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Printer
        </button>
      </div>

      {/* Printers List */}
      <div className="grid grid-cols-1 gap-4">
        {printers.map((printer) => (
          <motion.div
            key={printer.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-card p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${
                  printer.isActive ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <PrinterIcon className={`h-8 w-8 ${
                    printer.isActive ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-heading font-semibold text-gray-900">
                      {printer.deviceName}
                    </h3>
                    {printer.isDefault && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                        Default
                      </span>
                    )}
                    {printer.isActive ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-400 text-sm">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Model:</span>
                      <span className="ml-2 text-gray-900">{printer.deviceModel || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Connection:</span>
                      <span className="ml-2 text-gray-900">{printer.connectionType}</span>
                    </div>
                    {printer.ipAddress && (
                      <div>
                        <span className="text-gray-500">IP Address:</span>
                        <span className="ml-2 text-gray-900">{printer.ipAddress}</span>
                      </div>
                    )}
                    {printer.port && (
                      <div>
                        <span className="text-gray-500">Port:</span>
                        <span className="ml-2 text-gray-900">{printer.port}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleTestPrinter(printer.id)}
                  disabled={testingPrinter === printer.id}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-50"
                  title="Test Printer"
                >
                  {testingPrinter === printer.id ? (
                    <div className="loader-small"></div>
                  ) : (
                    <BeakerIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingPrinter(printer)
                    setShowForm(true)
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(printer.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {printers.length === 0 && (
        <div className="text-center py-12">
          <PrinterIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 mb-1">No printers configured</p>
          <p className="text-sm text-gray-600 mb-4">Add your first thermal printer to start printing receipts</p>
          <button
            onClick={() => {
              setEditingPrinter(null)
              setShowForm(true)
            }}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Printer
          </button>
        </div>
      )}

      {/* Printer Form Modal */}
      {showForm && (
        <PrinterForm
          printer={editingPrinter}
          onClose={() => setShowForm(false)}
          onSubmit={createMutation.mutate}
          loading={createMutation.isLoading}
        />
      )}
    </motion.div>
  )
}

// Printer Form Component
const PrinterForm = ({ printer, onClose, onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: printer || {
      deviceName: '',
      deviceModel: '',
      connectionType: 'USB',
      ipAddress: '',
      port: '',
      isDefault: false,
      isActive: true,
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
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10"
        >
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
            {printer ? 'Edit Printer' : 'Add Printer'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Printer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('deviceName', { required: 'Printer name is required' })}
                className={`input-field ${errors.deviceName ? 'border-red-500' : ''}`}
                placeholder="Thermal Printer 1"
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
                placeholder="EPSON TM-T20"
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

            {connectionType === 'NETWORK' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    {...register('ipAddress')}
                    className="input-field"
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    {...register('port')}
                    className="input-field"
                    placeholder="9100"
                  />
                </div>
              </>
            )}

            {connectionType === 'USB' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor ID
                  </label>
                  <input
                    type="text"
                    {...register('usbVendorId')}
                    className="input-field"
                    placeholder="0x0416"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product ID
                  </label>
                  <input
                    type="text"
                    {...register('usbProductId')}
                    className="input-field"
                    placeholder="0x5011"
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('isDefault')}
                id="isDefault"
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default printer
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('isActive')}
                id="isActive"
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active
              </label>
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
                {loading ? 'Saving...' : printer ? 'Update' : 'Add Printer'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default PrinterConfig
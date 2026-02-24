import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'
import api from '../../services/api'
import whatsappService from '../../services/whatsapp.service'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'
import { useTheme } from '../../contexts/ThemeContext'

const CampaignList = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState('')
  const [customerNames, setCustomerNames] = useState('')
  const [sendingBulk, setSendingBulk] = useState(false)
  const limit = 10
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page, status],
    queryFn: () => api.get('/campaigns', { 
      params: { 
        page, 
        limit,
        isActive: status === 'active' ? true : status === 'inactive' ? false : undefined
      } 
    }).then(res => res.data)
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns'])
      toast.success('Campaign deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete campaign')
    }
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, action }) => api.patch(`/campaigns/${id}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns'])
      toast.success('Campaign status updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update campaign')
    }
  })

  const handleDelete = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${name}"?`)) return
    deleteMutation.mutate(id)
  }

  const handleToggleStatus = (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    toggleStatusMutation.mutate({ id, action })
  }

  const handleBulkWhatsApp = async () => {
    if (!selectedCampaign) return
    
    const numbers = phoneNumbers.split('\n')
      .map(n => n.trim())
      .filter(n => n && n.length > 0)
    
    const names = customerNames.split('\n')
      .map(n => n.trim())
      .filter(n => n)

    if (numbers.length === 0) {
      toast.error('Please enter at least one phone number')
      return
    }

    // Validate phone numbers
    const invalidNumbers = numbers.filter(n => !whatsappService.validatePhoneNumber(n))
    if (invalidNumbers.length > 0) {
      toast.error(`Invalid phone numbers: ${invalidNumbers.join(', ')}`)
      return
    }

    setSendingBulk(true)
    try {
      const results = await whatsappService.sendBulkCampaignOffers(
        selectedCampaign.id, 
        numbers,
        names
      )
      
      toast.success(
        `✅ WhatsApp messages sent from ${whatsappService.getBusinessNumber()}\n` +
        `✅ Successful: ${results.successful.length}\n` +
        `❌ Failed: ${results.failed.length}`,
        { duration: 5000 }
      )
      
      // Log results for debugging
      console.log('📱 Bulk WhatsApp Results:', results)
      
      setShowWhatsAppModal(false)
      setSelectedCampaign(null)
      setPhoneNumbers('')
      setCustomerNames('')
    } catch (error) {
      toast.error('Failed to send bulk messages')
    } finally {
      setSendingBulk(false)
    }
  }

  const getStatusBadge = (campaign) => {
    const now = new Date()
    const start = new Date(campaign.startDate)
    const end = new Date(campaign.endDate)

    if (!campaign.isActive) {
      return { label: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
    }
    if (now < start) {
      return { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' }
    }
    if (now > end) {
      return { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
    }
    return { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' }
  }

  if (isLoading) return <Loader />

  const campaigns = data?.data || []
  const pagination = data?.pagination || { total: 0, pages: 1 }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-heading font-bold ${theme.text.primary}`}>Campaigns</h1>
          <p className={`${theme.text.secondary} mt-1`}>Manage marketing campaigns and offers</p>
        </div>
        
        <Link
          to="/campaigns/new"
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Campaign
        </Link>
      </div>

      {/* WhatsApp Business Info */}
      <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              WhatsApp Business Number: {whatsappService.getBusinessNumber()}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Messages will be sent from this number to customers
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${theme.bg.card} rounded-lg shadow-card p-4`}>
        <div className="flex space-x-2">
          {['all', 'active', 'inactive'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatus(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === filter
                  ? 'bg-primary-500 text-white'
                  : `${theme.text.secondary} ${theme.bg.hover}`
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => {
          const status = getStatusBadge(campaign)
          
          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${theme.bg.card} rounded-xl shadow-card overflow-hidden hover:shadow-hover transition-all`}
            >
              {/* Campaign Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-xl">
                    <TagIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <h3 className={`text-lg font-heading font-semibold ${theme.text.primary} mb-2`}>
                  {campaign.name}
                </h3>
                <p className={`text-sm ${theme.text.secondary} mb-3 line-clamp-2`}>
                  {campaign.description || 'No description provided'}
                </p>

                {/* Date Range */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {format(new Date(campaign.startDate), 'dd MMM')} - {format(new Date(campaign.endDate), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Campaign Stats */}
              <div className={`px-6 py-3 ${theme.bg.secondary} border-t ${theme.border.primary}`}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className={`text-xs ${theme.text.secondary}`}>Discount</p>
                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                      {campaign.discountType === 'PERCENTAGE' 
                        ? `${campaign.discountValue}%`
                        : `₹${campaign.discountValue}`}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme.text.secondary}`}>Used</p>
                    <p className={`text-sm font-semibold ${theme.text.primary}`}>
                      {campaign.usedCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme.text.secondary}`}>Target</p>
                    <p className={`text-sm font-semibold ${theme.text.primary}`}>
                      {campaign.targetType?.split('_')[0] || 'All'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={`px-6 py-3 border-t ${theme.border.primary} flex justify-end space-x-2`}>
                <button
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/50 rounded-lg"
                  title="View Details"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedCampaign(campaign)
                    setShowWhatsAppModal(true)
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-lg"
                  title="Send via WhatsApp"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(campaign.id, campaign.isActive)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-lg"
                  title={campaign.isActive ? 'Deactivate' : 'Activate'}
                >
                  {campaign.isActive ? (
                    <CheckCircleIcon className="h-4 w-4" />
                  ) : (
                    <XCircleIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(campaign.id, campaign.name)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <TagIcon className={`h-12 w-12 mx-auto mb-3 ${theme.text.tertiary}`} />
          <p className={`text-lg font-medium ${theme.text.primary} mb-1`}>No campaigns found</p>
          <p className={`text-sm ${theme.text.secondary} mb-4`}>Create your first marketing campaign</p>
          <Link to="/campaigns/new" className="btn-primary inline-flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Campaign
          </Link>
        </div>
      )}

      {/* WhatsApp Bulk Send Modal */}
      <AnimatePresence>
        {showWhatsAppModal && selectedCampaign && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowWhatsAppModal(false)} />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative ${theme.bg.card} rounded-xl shadow-xl max-w-lg w-full p-6 z-10`}
              >
                <h2 className={`text-xl font-heading font-bold ${theme.text.primary} mb-4`}>
                  Send Campaign via WhatsApp
                </h2>

                {/* Campaign Info */}
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                    Campaign: {selectedCampaign.name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Sending from: {whatsappService.getBusinessNumber()}
                  </p>
                </div>

                {/* Phone Numbers Input */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                    Phone Numbers <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={phoneNumbers}
                    onChange={(e) => setPhoneNumbers(e.target.value)}
                    rows="4"
                    className="input-field"
                    placeholder="9876543210
9876543211
9876543212"
                  />
                  <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                    Enter 10-digit Indian mobile numbers, one per line
                  </p>
                </div>

                {/* Customer Names (Optional) */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                    Customer Names (Optional)
                  </label>
                  <textarea
                    value={customerNames}
                    onChange={(e) => setCustomerNames(e.target.value)}
                    rows="4"
                    className="input-field"
                    placeholder="John Doe
Jane Smith
Bob Johnson"
                  />
                  <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                    Enter names in the same order as phone numbers (optional)
                  </p>
                </div>

                {/* Stats */}
                {phoneNumbers && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className={`text-sm ${theme.text.secondary}`}>
                      Total Recipients: {phoneNumbers.split('\n').filter(n => n.trim()).length}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowWhatsAppModal(false)
                      setSelectedCampaign(null)
                      setPhoneNumbers('')
                      setCustomerNames('')
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkWhatsApp}
                    disabled={sendingBulk || !phoneNumbers.trim()}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 inline-flex items-center"
                  >
                    {sendingBulk ? (
                      <>
                        <div className="loader-small mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                        Send to All
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="px-3 py-1 bg-primary-500 text-white rounded-md text-sm">
            {page}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default CampaignList
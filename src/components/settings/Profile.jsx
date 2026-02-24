import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { motion } from 'framer-motion'
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, login } = useAuth()
  const theme = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      await api.put('/users/profile', formData)
      toast.success('Profile updated successfully')
      setIsEditing(false)
      // Refresh user data
      const response = await api.get('/auth/me')
      login(response.data.user)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-heading font-bold ${theme.text.primary}`}>Profile Settings</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary inline-flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleSave}
              className="btn-primary inline-flex items-center"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Save
            </button>
          </div>
        )}
      </div>

      <div className={`${theme.bg.card} rounded-xl shadow-card p-6`}>
        {/* Avatar Section */}
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <UserCircleIcon className="h-20 w-20 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <div>
            <h2 className={`text-xl font-heading font-semibold ${theme.text.primary}`}>{user?.name}</h2>
            <p className={`text-sm ${theme.text.secondary} capitalize`}>{user?.role?.toLowerCase()}</p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <UserCircleIcon className="h-5 w-5 text-gray-400" />
                  <span className={`text-sm ${theme.text.primary}`}>{user?.name}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <span className={`text-sm ${theme.text.primary}`}>{user?.email}</span>
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <span className={`text-sm ${theme.text.primary}`}>{user?.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Role Field (Read-only) */}
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Role
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                <span className={`text-sm ${theme.text.primary} capitalize`}>{user?.role?.toLowerCase()}</span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className={`text-sm font-medium ${theme.text.primary} mb-3`}>Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className={`text-xs ${theme.text.secondary}`}>Member Since</p>
                <p className={`font-medium ${theme.text.primary}`}>
                  {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className={`text-xs ${theme.text.secondary}`}>Last Login</p>
                <p className={`font-medium ${theme.text.primary}`}>
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Profile
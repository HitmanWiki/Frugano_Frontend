import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'

const RoleManagement = () => {
  const [editingRole, setEditingRole] = useState(null)
  const [permissions, setPermissions] = useState({})
  const queryClient = useQueryClient()

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/roles').then(res => res.data)
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ roleId, permissions }) => 
      api.put(`/roles/${roleId}`, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles'])
      toast.success('Role permissions updated')
      setEditingRole(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update role')
    }
  })

  const availablePermissions = [
    { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to dashboard' },
    { id: 'manage_products', name: 'Manage Products', description: 'Create, edit, delete products' },
    { id: 'view_products', name: 'View Products', description: 'View product catalog' },
    { id: 'manage_categories', name: 'Manage Categories', description: 'Create, edit, delete categories' },
    { id: 'create_sales', name: 'Create Sales', description: 'Process sales at POS' },
    { id: 'view_sales', name: 'View Sales', description: 'View sales history' },
    { id: 'void_sales', name: 'Void Sales', description: 'Cancel/void sales' },
    { id: 'manage_purchases', name: 'Manage Purchases', description: 'Create and manage purchases' },
    { id: 'view_purchases', name: 'View Purchases', description: 'View purchase history' },
    { id: 'manage_suppliers', name: 'Manage Suppliers', description: 'Create, edit, delete suppliers' },
    { id: 'view_suppliers', name: 'View Suppliers', description: 'View supplier list' },
    { id: 'manage_inventory', name: 'Manage Inventory', description: 'Update stock, manage inventory' },
    { id: 'view_inventory', name: 'View Inventory', description: 'View stock levels' },
    { id: 'manage_customers', name: 'Manage Customers', description: 'Create, edit, delete customers' },
    { id: 'view_customers', name: 'View Customers', description: 'View customer list' },
    { id: 'manage_campaigns', name: 'Manage Campaigns', description: 'Create and manage campaigns' },
    { id: 'view_reports', name: 'View Reports', description: 'Access reports' },
    { id: 'export_data', name: 'Export Data', description: 'Export reports and data' },
    { id: 'manage_users', name: 'Manage Users', description: 'Create, edit, delete users' },
    { id: 'manage_roles', name: 'Manage Roles', description: 'Edit role permissions' },
    { id: 'manage_settings', name: 'Manage Settings', description: 'Edit store settings' },
    { id: 'view_hardware', name: 'View Hardware', description: 'View hardware configuration' },
    { id: 'manage_hardware', name: 'Manage Hardware', description: 'Configure printers, scales' },
    { id: 'view_deliveries', name: 'View Deliveries', description: 'View delivery assignments' },
    { id: 'update_delivery', name: 'Update Delivery', description: 'Update delivery status' },
  ]

  const handleEditRole = (role) => {
    setEditingRole(role.id)
    setPermissions(role.permissions || {})
  }

  const handleSaveRole = (roleId) => {
    updateRoleMutation.mutate({ roleId, permissions })
  }

  const togglePermission = (permissionId) => {
    setPermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId]
    }))
  }

  const getRoleColor = (roleName) => {
    switch(roleName) {
      case 'OWNER': return 'bg-purple-100 text-purple-800'
      case 'MANAGER': return 'bg-blue-100 text-blue-800'
      case 'CASHIER': return 'bg-green-100 text-green-800'
      case 'INVENTORY_STAFF': return 'bg-yellow-100 text-yellow-800'
      case 'DELIVERY_BOY': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) return <Loader />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Role Management</h1>
        <p className="text-gray-600 mt-1">Configure permissions for each user role</p>
      </div>

      {/* Roles Grid */}
      <div className="space-y-6">
        {roles?.data?.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-card overflow-hidden"
          >
            {/* Role Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-heading font-semibold text-gray-900">
                      {role.name}
                    </h2>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role.name)}`}>
                  {role.userCount || 0} users
                </span>
              </div>
            </div>

            {/* Permissions Grid */}
            <div className="p-6">
              {editingRole === role.id ? (
                // Edit Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availablePermissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={permissions[permission.id] || false}
                          onChange={() => togglePermission(permission.id)}
                          className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setEditingRole(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveRole(role.id)}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Permissions
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(role.permissions || {})
                      .filter(([_, value]) => value)
                      .map(([permissionId]) => {
                        const permission = availablePermissions.find(p => p.id === permissionId)
                        return permission ? (
                          <div
                            key={permissionId}
                            className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg"
                          >
                            <CheckIcon className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-700">{permission.name}</span>
                          </div>
                        ) : null
                      })}
                  </div>

                  {Object.values(role.permissions || {}).filter(v => v).length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No permissions assigned
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default RoleManagement
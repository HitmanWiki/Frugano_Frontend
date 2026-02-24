import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Additional auth-related hooks
export const usePermissions = () => {
  const { user, hasPermission } = useAuth()
  
  const can = (permission) => {
    return hasPermission(permission)
  }

  const cannot = (permission) => {
    return !hasPermission(permission)
  }

  return { can, cannot, user }
}

export const useRole = () => {
  const { user } = useAuth()
  return user?.role
}

export const useIsOwner = () => {
  const role = useRole()
  return role === 'OWNER'
}

export const useIsManager = () => {
  const role = useRole()
  return role === 'MANAGER' || role === 'OWNER'
}

export const useIsCashier = () => {
  const role = useRole()
  return role === 'CASHIER' || role === 'MANAGER' || role === 'OWNER'
}
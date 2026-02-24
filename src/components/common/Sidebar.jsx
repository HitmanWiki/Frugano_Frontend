import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  TagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  GiftIcon,
  PrinterIcon,
  ChevronDownIcon,
  FolderIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Logo from './Logo' 

const Sidebar = ({ closeSidebar }) => {
  const { user } = useAuth()
  const theme = useTheme()
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState({})
  const sidebarRef = useRef(null)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['OWNER', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF'],
    },
    {
      name: 'Sales',
      icon: ShoppingCartIcon,
      roles: ['OWNER', 'MANAGER', 'CASHIER'],
      children: [
        { name: 'Point of Sale', href: '/sales/pos', icon: ShoppingCartIcon },
        { name: 'Sales History', href: '/sales', icon: ClipboardDocumentListIcon },
      ],
    },
    {
      name: 'Products',
      icon: CubeIcon,
      roles: ['OWNER', 'MANAGER', 'INVENTORY_STAFF'],
      children: [
        { name: 'All Products', href: '/products', icon: CubeIcon },
        { name: 'Add Product', href: '/products/new', icon: TagIcon },
        { name: 'Categories', href: '/categories', icon: FolderIcon },
      ],
    },
    {
      name: 'Purchases',
      icon: ShoppingBagIcon,
      roles: ['OWNER', 'MANAGER', 'INVENTORY_STAFF'],
      children: [
        { name: 'All Purchases', href: '/purchases', icon: ShoppingBagIcon },
        { name: 'New Purchase', href: '/purchases/new', icon: TagIcon },
        { name: 'Suppliers', href: '/suppliers', icon: TruckIcon },
      ],
    },
    {
      name: 'Inventory',
      icon: ClipboardDocumentListIcon,
      roles: ['OWNER', 'MANAGER', 'INVENTORY_STAFF'],
      children: [
        { name: 'Stock Status', href: '/inventory', icon: ClipboardDocumentListIcon },
        { name: 'Stock Alerts', href: '/inventory/alerts', icon: TagIcon },
      ],
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: UsersIcon,
      roles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      name: 'Campaigns',
      href: '/campaigns',
      icon: GiftIcon,
      roles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      roles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'Hardware',
      icon: PrinterIcon,
      roles: ['OWNER', 'MANAGER'],
      children: [
        { name: 'Printers', href: '/hardware/printers', icon: PrinterIcon },
        { name: 'Weighing Scale', href: '/hardware/scale', icon: Cog6ToothIcon },
      ],
    },
    {
      name: 'Settings',
      icon: Cog6ToothIcon,
      roles: ['OWNER', 'MANAGER'],
      children: [
        { name: 'Users', href: '/settings/users', icon: UsersIcon },
        { name: 'Store Settings', href: '/settings/store', icon: Cog6ToothIcon },
      ],
    },
  ]

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    item.roles?.includes(user?.role)
  )

  // Auto-expand menus based on current route
  useEffect(() => {
    const newOpenMenus = {}
    
    filteredNavigation.forEach((item, index) => {
      if (item.children) {
        const isActive = item.children.some(child => 
          location.pathname === child.href || 
          location.pathname.startsWith(child.href + '/')
        )
        if (isActive) {
          newOpenMenus[index] = true
        }
      }
    })
    
    setOpenMenus(newOpenMenus)
  }, [location.pathname])

  const toggleMenu = (index) => {
    setOpenMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      closeSidebar()
    }
  }

  // Don't render if no user
  if (!user) return null

  return (
    <aside 
      ref={sidebarRef}
      className={`w-64 h-full ${theme.sidebar} shadow-lg flex flex-col border-r ${theme.border.primary}`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center justify-between px-4 border-b ${theme.border.primary}`}>
  <Logo size="sm" />
  <button
    onClick={closeSidebar}
    className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
  >
    <XMarkIcon className="h-5 w-5" />
  </button>
</div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredNavigation.map((item, index) => (
            <li key={item.name}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(index)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      openMenus[index]
                        ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform duration-200 ${
                        openMenus[index] ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {openMenus[index] && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.name}>
                          <NavLink
                            to={child.href}
                            onClick={handleLinkClick}
                            className={({ isActive }) =>
                              `flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive
                                  ? 'bg-primary-500 text-white'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`
                            }
                          >
                            <child.icon className="h-4 w-4 mr-2" />
                            {child.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.href}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className={`border-t ${theme.border.primary} p-4`}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-primary-700 dark:text-primary-300 font-medium text-sm">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${theme.text.primary}`}>{user?.name}</p>
            <p className={`text-xs ${theme.text.secondary} capitalize`}>{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
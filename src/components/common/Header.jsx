import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import { useTheme } from '../../contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'
import { useNavigate } from 'react-router-dom'

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth()
  const { online } = useSocket()
  const theme = useTheme()
  const navigate = useNavigate()

  // Simple menu item component without forwardRef (let Headless UI handle it)
  const MenuItem = ({ onClick, children, icon: Icon }) => (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={`${
            active ? theme.bg.hover : ''
          } flex items-center w-full text-left px-4 py-2 text-sm ${theme.text.primary}`}
        >
          {Icon && <Icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />}
          {children}
        </button>
      )}
    </Menu.Item>
  )

  const LogoutItem = ({ onClick, children, icon: Icon }) => (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={`${
            active ? 'bg-red-50 dark:bg-red-900/20' : ''
          } flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400`}
        >
          {Icon && <Icon className="mr-3 h-5 w-5 text-red-400" aria-hidden="true" />}
          {children}
        </button>
      )}
    </Menu.Item>
  )

  return (
    <header className={`${theme.header} shadow sticky top-0 z-30 transition-colors duration-200 border-b ${theme.border.primary}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="ml-4 lg:ml-0 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <Logo size="sm" />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Connection status */}
            <div className="hidden sm:flex items-center">
              <div className={`h-2 w-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className={`ml-2 text-sm ${theme.text.secondary}`}>
                {online ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 object-cover" />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className={`text-sm font-medium ${theme.text.primary}`}>{user?.name}</p>
                  <p className={`text-xs ${theme.text.secondary} capitalize`}>{user?.role?.toLowerCase()}</p>
                </div>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className={`absolute right-0 mt-2 w-56 origin-top-right ${theme.bg.card} rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700`}>
                  {/* User Info Header */}
                  <div className="px-4 py-3">
                    <p className={`text-sm font-medium ${theme.text.primary}`}>{user?.name}</p>
                    <p className={`text-xs ${theme.text.secondary} truncate`}>{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <MenuItem onClick={() => navigate('/settings/profile')} icon={UserIcon}>
                      Your Profile
                    </MenuItem>
                    
                    <MenuItem onClick={() => navigate('/settings')} icon={Cog6ToothIcon}>
                      Settings
                    </MenuItem>
                  </div>

                  {/* Logout */}
                  <div className="py-1">
                    <LogoutItem onClick={logout} icon={ArrowRightOnRectangleIcon}>
                      Sign out
                    </LogoutItem>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { motion } from 'framer-motion'
import { 
  UserCircleIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  BellIcon,
  PaintBrushIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'

const Settings = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          name: 'Profile',
          description: 'Manage your personal information',
          icon: UserCircleIcon,
          path: '/settings/profile',
          color: 'bg-blue-500'
        },
        {
          name: 'Notifications',
          description: 'Configure notification preferences',
          icon: BellIcon,
          path: '/settings/notifications',
          color: 'bg-purple-500',
          disabled: true
        }
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          name: 'Theme',
          description: 'Customize the look and feel',
          icon: PaintBrushIcon,
          path: '/settings/theme',
          color: 'bg-pink-500',
          disabled: true
        }
      ]
    },
    ...(user?.role === 'OWNER' || user?.role === 'MANAGER' ? [
      {
        title: 'Administration',
        items: [
          {
            name: 'User Management',
            description: 'Manage system users and permissions',
            icon: UsersIcon,
            path: '/settings/users',
            color: 'bg-green-500'
          },
          {
            name: 'Store Settings',
            description: 'Configure store information',
            icon: BuildingStorefrontIcon,
            path: '/settings/store',
            color: 'bg-orange-500'
          },
          {
            name: 'Roles & Permissions',
            description: 'Manage user roles and access',
            icon: ShieldCheckIcon,
            path: '/settings/roles',
            color: 'bg-red-500',
            disabled: true
          }
        ]
      }
    ] : [])
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className={`text-2xl font-heading font-bold ${theme.text.primary} mb-6`}>Settings</h1>

      <div className="space-y-8">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h2 className={`text-lg font-heading font-semibold ${theme.text.primary} mb-4`}>
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => !item.disabled && navigate(item.path)}
                  disabled={item.disabled}
                  className={`${theme.bg.card} rounded-xl shadow-card p-6 hover:shadow-hover transition-all text-left ${
                    item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-102'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${item.color} bg-opacity-10`}>
                        <item.icon className={`h-6 w-6 ${item.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <h3 className={`text-base font-heading font-semibold ${theme.text.primary}`}>
                          {item.name}
                        </h3>
                        <p className={`text-sm ${theme.text.secondary} mt-1`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon className={`h-5 w-5 ${theme.text.secondary}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default Settings
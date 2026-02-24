import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  ShoppingCartIcon,
  CubeIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  TagIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'

const getActivityIcon = (action) => {
  switch (action) {
    case 'CREATE_SALE':
      return <ShoppingCartIcon className="h-5 w-5 text-green-600" />
    case 'CREATE_PRODUCT':
      return <CubeIcon className="h-5 w-5 text-blue-600" />
    case 'CREATE_CUSTOMER':
      return <UserPlusIcon className="h-5 w-5 text-purple-600" />
    case 'CREATE_PURCHASE':
      return <CurrencyDollarIcon className="h-5 w-5 text-yellow-600" />
    case 'CREATE_CAMPAIGN':
      return <TagIcon className="h-5 w-5 text-pink-600" />
    case 'UPDATE_DELIVERY':
      return <TruckIcon className="h-5 w-5 text-orange-600" />
    default:
      return <ShoppingCartIcon className="h-5 w-5 text-gray-600" />
  }
}

const getActivityColor = (action) => {
  switch (action) {
    case 'CREATE_SALE':
      return 'bg-green-100'
    case 'CREATE_PRODUCT':
      return 'bg-blue-100'
    case 'CREATE_CUSTOMER':
      return 'bg-purple-100'
    case 'CREATE_PURCHASE':
      return 'bg-yellow-100'
    case 'CREATE_CAMPAIGN':
      return 'bg-pink-100'
    case 'UPDATE_DELIVERY':
      return 'bg-orange-100'
    default:
      return 'bg-gray-100'
  }
}

const RecentActivities = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Recent Activities
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activities</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-gray-900">
          Recent Activities
        </h2>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All
        </button>
      </div>

      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index !== activities.length - 1 && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className={`relative px-1 ${getActivityColor(activity.action)} rounded-full p-2`}>
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-sm text-gray-900">
                        {activity.action?.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {activity.user && (
                      <p className="mt-1 text-xs text-gray-500">
                        by {activity.user.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default RecentActivities
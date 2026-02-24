import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const StatCard = ({ title, value, icon: Icon, color, trend, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-card p-6 hover:shadow-hover transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-2xl font-heading font-bold text-gray-900">
              {typeof value === 'number' && title.includes('Revenue') 
                ? `₹${value.toLocaleString('en-IN')}`
                : value?.toLocaleString('en-IN') || '0'}
            </p>
          )}
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${
                trend >= 0 ? 'text-green-500' : 'text-red-500'
              }`} />
              <span className={`text-xs ${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(trend)}% vs last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </motion.div>
  )
}

const StatsCards = ({ data, loading }) => {
  const stats = [
    {
      title: "Today's Revenue",
      value: data?.today?.revenue,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      trend: 12,
    },
    {
      title: "Today's Sales",
      value: data?.today?.sales,
      icon: ShoppingCartIcon,
      color: 'bg-blue-500',
      trend: 8,
    },
    {
      title: 'Total Products',
      value: data?.inventory?.totalProducts,
      icon: CubeIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Customers',
      value: data?.customers,
      icon: UsersIcon,
      color: 'bg-orange-500',
      trend: 15,
    },
    {
      title: 'Low Stock Items',
      value: data?.inventory?.lowStock,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
    },
    {
      title: 'Monthly Revenue',
      value: data?.month?.revenue,
      icon: CurrencyDollarIcon,
      color: 'bg-indigo-500',
      trend: 5,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} loading={loading} />
      ))}
    </div>
  )
}

export default StatsCards
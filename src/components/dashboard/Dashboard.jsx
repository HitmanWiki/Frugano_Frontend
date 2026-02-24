import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import api from '../../services/api'
import StatsCards from './StatsCards'
import SalesChart from './SalesChart'
import RecentActivities from './RecentActivities'
import TopProducts from './TopProducts'
import Loader from '../common/Loader'

const Dashboard = () => {
  const [period, setPeriod] = useState('week')
  const theme = useTheme()

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get('/dashboard/summary').then(res => res.data.data),
  })

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts', period],
    queryFn: () => api.get(`/dashboard/charts?period=${period}`).then(res => res.data.data),
  })

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: () => api.get('/dashboard/recent').then(res => res.data.data),
  })

  if (summaryLoading || chartsLoading || activitiesLoading) {
    return <Loader />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-heading font-bold ${theme.text.primary}`}>
            Dashboard Overview
          </h1>
          <p className={`${theme.text.secondary} mt-1`}>
            Welcome back, {summary?.user?.name || 'User'}!
          </p>
        </div>
        <div className={`flex space-x-2 ${theme.bg.secondary} p-1 rounded-lg shadow-soft`}>
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-primary-500 text-white'
                  : `${theme.text.secondary} hover:bg-gray-100 dark:hover:bg-gray-700`
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards data={summary} />

      {/* Charts and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={charts?.sales} period={period} />
        </div>
        <div className="lg:col-span-1">
          <TopProducts products={summary?.topProducts} />
        </div>
      </div>

      {/* Recent Activities */}
      <RecentActivities activities={activities} />
    </motion.div>
  )
}

export default Dashboard
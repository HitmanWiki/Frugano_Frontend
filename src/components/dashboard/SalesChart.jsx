import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: ₹{entry.value.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const SalesChart = ({ data = { labels: [], values: [] }, period = 'week' }) => {
  // Format data for Recharts
  const chartData = data.labels?.map((label, index) => ({
    name: label,
    revenue: data.values?.[index] || 0,
    orders: Math.floor((data.values?.[index] || 0) / 100) * 5,
  })) || []

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
  const averageRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-xl shadow-card p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-heading font-semibold text-gray-900">
            Sales Overview
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {period === 'week' ? 'Last 7 days' : period === 'month' ? 'Last 30 days' : 'Last 12 months'}
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-3 sm:mt-0">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-lg font-heading font-semibold text-primary-600">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Daily Average</p>
            <p className="text-lg font-heading font-semibold text-gray-700">
              ₹{averageRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `₹${value}`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend />
            
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#1B4D3E"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              activeDot={{ r: 6, fill: '#1B4D3E' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default SalesChart
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  CubeIcon,
  ShoppingCartIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#1B4D3E', '#FFA500', '#FF4F4F', '#B1D8B7', '#65B065', '#8FC98F']

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('sales')
  const [dateRange, setDateRange] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [customRange, setCustomRange] = useState(false)

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['reports', 'sales', dateRange, startDate, endDate],
    queryFn: () => api.get('/reports/sales', {
      params: { 
        period: !customRange ? dateRange : undefined,
        startDate: customRange ? startDate : undefined,
        endDate: customRange ? endDate : undefined
      }
    }).then(res => res.data),
    enabled: reportType === 'sales'
  })

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: () => api.get('/reports/inventory').then(res => res.data),
    enabled: reportType === 'inventory'
  })

  const { data: profitData, isLoading: profitLoading } = useQuery({
    queryKey: ['reports', 'profit', dateRange, startDate, endDate],
    queryFn: () => api.get('/reports/profit', {
      params: { 
        period: !customRange ? dateRange : undefined,
        startDate: customRange ? startDate : undefined,
        endDate: customRange ? endDate : undefined
      }
    }).then(res => res.data),
    enabled: reportType === 'profit'
  })

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/reports/export/${reportType}/${format}`, {
        params: {
          startDate: customRange ? startDate : undefined,
          endDate: customRange ? endDate : undefined
        },
        responseType: 'blob'
      })

      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${reportType}-report.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Report exported successfully')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const isLoading = salesLoading || inventoryLoading || profitLoading

  if (isLoading) return <Loader />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate and export business reports</p>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setReportType('sales')}
            className={`p-4 rounded-xl border-2 transition-all ${
              reportType === 'sales'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <ShoppingCartIcon className={`h-8 w-8 mb-2 ${
              reportType === 'sales' ? 'text-primary-600' : 'text-gray-400'
            }`} />
            <h3 className={`font-heading font-semibold ${
              reportType === 'sales' ? 'text-primary-600' : 'text-gray-700'
            }`}>Sales Report</h3>
            <p className="text-xs text-gray-500 mt-1">View sales performance and trends</p>
          </button>

          <button
            onClick={() => setReportType('inventory')}
            className={`p-4 rounded-xl border-2 transition-all ${
              reportType === 'inventory'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <CubeIcon className={`h-8 w-8 mb-2 ${
              reportType === 'inventory' ? 'text-primary-600' : 'text-gray-400'
            }`} />
            <h3 className={`font-heading font-semibold ${
              reportType === 'inventory' ? 'text-primary-600' : 'text-gray-700'
            }`}>Inventory Report</h3>
            <p className="text-xs text-gray-500 mt-1">Stock levels and valuation</p>
          </button>

          <button
            onClick={() => setReportType('profit')}
            className={`p-4 rounded-xl border-2 transition-all ${
              reportType === 'profit'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <CurrencyRupeeIcon className={`h-8 w-8 mb-2 ${
              reportType === 'profit' ? 'text-primary-600' : 'text-gray-400'
            }`} />
            <h3 className={`font-heading font-semibold ${
              reportType === 'profit' ? 'text-primary-600' : 'text-gray-700'
            }`}>Profit & Loss</h3>
            <p className="text-xs text-gray-500 mt-1">Revenue, costs, and profits</p>
          </button>
        </div>
      </div>

      {/* Date Range Selection */}
      {reportType !== 'inventory' && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setCustomRange(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !customRange
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Preset Ranges
            </button>
            <button
              onClick={() => setCustomRange(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                customRange
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Custom Range
            </button>
          </div>

          {!customRange ? (
            <div className="flex space-x-2">
              {['week', 'month', 'quarter', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-card p-6">
        {/* Sales Report */}
        {reportType === 'sales' && salesData && (
          <SalesReport data={salesData.data} />
        )}

        {/* Inventory Report */}
        {reportType === 'inventory' && inventoryData && (
          <InventoryReport data={inventoryData.data} />
        )}

        {/* Profit Report */}
        {reportType === 'profit' && profitData && (
          <ProfitReport data={profitData.data} />
        )}

        {/* Export Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <button
            onClick={() => handleExport('excel')}
            className="btn-secondary inline-flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export as Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="btn-secondary inline-flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export as PDF
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Sales Report Component
const SalesReport = ({ data }) => {
  const chartData = data?.sales?.map(item => ({
    date: format(new Date(item.saleDate), 'dd MMM'),
    amount: item._sum?.totalAmount || 0
  })) || []

  const categoryData = data?.categories?.map(item => ({
    name: item.name,
    value: item.revenue
  })) || []

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">{data?.summary?.totalSales || 0}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-primary-600">₹{(data?.summary?.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Average Ticket</p>
          <p className="text-2xl font-bold text-gray-900">₹{(data?.summary?.averageTicket || 0).toFixed(2)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Discount</p>
          <p className="text-2xl font-bold text-gray-900">₹{(data?.summary?.totalDiscount || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" name="Revenue" fill="#1B4D3E" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Category Breakdown</h3>
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Inventory Report Component
const InventoryReport = ({ data }) => {
  const products = data?.products || []
  const summary = data?.summary || {}

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalProducts || 0}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Inventory Value</p>
          <p className="text-2xl font-bold text-primary-600">₹{(summary.totalValue || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
          <p className="text-2xl font-bold text-yellow-600">{summary.lowStock || 0}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{summary.outOfStock || 0}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Stock</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Unit</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Purchase Price</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Selling Price</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.category?.name}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  <span className={product.currentStock <= product.minStockAlert ? 'text-yellow-600' : 'text-gray-900'}>
                    {product.currentStock}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">{product.unit}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{product.purchasePrice}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{product.sellingPrice}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-primary-600">
                  ₹{(product.currentStock * product.purchasePrice).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Profit Report Component
const ProfitReport = ({ data }) => {
  const summary = data?.summary || {}

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">₹{(summary.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-red-600">₹{(summary.totalCost || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Gross Profit</p>
          <p className="text-2xl font-bold text-primary-600">₹{(summary.grossProfit || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Net Profit</p>
          <p className="text-2xl font-bold text-primary-600">₹{(summary.netProfit || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Profit Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Profit Margin</p>
          <p className="text-3xl font-bold text-primary-600">{summary.margin?.toFixed(2) || 0}%</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${Math.min(100, summary.margin || 0)}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Discount Impact</p>
          <p className="text-3xl font-bold text-yellow-600">₹{(summary.totalDiscount || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">
            {((summary.totalDiscount / summary.totalRevenue) * 100).toFixed(2)}% of revenue
          </p>
        </div>
      </div>

      {/* Period Info */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Report Period: {data?.period?.start ? format(new Date(data.period.start), 'dd MMM yyyy') : 'N/A'} - {data?.period?.end ? format(new Date(data.period.end), 'dd MMM yyyy') : 'N/A'}
        </p>
      </div>
    </div>
  )
}

export default ReportGenerator
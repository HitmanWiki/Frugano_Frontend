import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useReactToPrint } from 'react-to-print'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Loader from '../common/Loader'

const ReportViewer = () => {
  const { type, id } = useParams()
  const printRef = useRef()
  const [exporting, setExporting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', type, id],
    queryFn: () => api.get(`/reports/${type}/${id}`).then(res => res.data)
  })

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${type}-report-${id}`,
  })

  const handleExport = async (format) => {
    setExporting(true)
    try {
      const response = await api.get(`/reports/export/${type}/${format}`, {
        params: { id },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}-report-${id}.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Report exported successfully')
    } catch (error) {
      toast.error('Failed to export report')
    } finally {
      setExporting(false)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            {data?.title || 'Report Viewer'}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="btn-secondary inline-flex items-center"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="btn-secondary inline-flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={printRef} className="bg-white rounded-xl shadow-card p-8">
        {/* Report Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-heading font-bold text-primary-600 mb-2">Frugano</h2>
          <p className="text-lg text-gray-600 mb-1">{data?.title}</p>
          <p className="text-sm text-gray-500">
            Generated on: {format(new Date(), 'dd MMM yyyy, hh:mm a')}
          </p>
        </div>

        {/* Report Content - Based on Type */}
        {type === 'sales' && <SalesReportContent data={data} />}
        {type === 'inventory' && <InventoryReportContent data={data} />}
        {type === 'profit' && <ProfitReportContent data={data} />}
      </div>
    </motion.div>
  )
}

// Sales Report Content
const SalesReportContent = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Total Sales</p>
        <p className="text-xl font-bold">{data?.summary?.totalSales || 0}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Total Revenue</p>
        <p className="text-xl font-bold">₹{(data?.summary?.totalRevenue || 0).toLocaleString()}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Average Ticket</p>
        <p className="text-xl font-bold">₹{(data?.summary?.averageTicket || 0).toFixed(2)}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Total Discount</p>
        <p className="text-xl font-bold">₹{(data?.summary?.totalDiscount || 0).toLocaleString()}</p>
      </div>
    </div>

    <table className="min-w-full">
      <thead>
        <tr className="border-b">
          <th className="py-2 text-left">Date</th>
          <th className="py-2 text-left">Invoice</th>
          <th className="py-2 text-left">Customer</th>
          <th className="py-2 text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {data?.sales?.map((sale) => (
          <tr key={sale.id} className="border-b">
            <td className="py-2">{format(new Date(sale.saleDate), 'dd/MM/yyyy')}</td>
            <td className="py-2">{sale.invoiceNo}</td>
            <td className="py-2">{sale.customerName || 'Walk-in'}</td>
            <td className="py-2 text-right">₹{sale.totalAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// Inventory Report Content
const InventoryReportContent = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Total Products</p>
        <p className="text-xl font-bold">{data?.summary?.totalProducts || 0}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Total Value</p>
        <p className="text-xl font-bold">₹{(data?.summary?.totalValue || 0).toLocaleString()}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Low Stock</p>
        <p className="text-xl font-bold">{data?.summary?.lowStock || 0}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Out of Stock</p>
        <p className="text-xl font-bold">{data?.summary?.outOfStock || 0}</p>
      </div>
    </div>

    <table className="min-w-full">
      <thead>
        <tr className="border-b">
          <th className="py-2 text-left">Product</th>
          <th className="py-2 text-left">Category</th>
          <th className="py-2 text-right">Stock</th>
          <th className="py-2 text-right">Value</th>
        </tr>
      </thead>
      <tbody>
        {data?.products?.map((product) => (
          <tr key={product.id} className="border-b">
            <td className="py-2">{product.name}</td>
            <td className="py-2">{product.category}</td>
            <td className="py-2 text-right">{product.stock}</td>
            <td className="py-2 text-right">₹{product.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// Profit Report Content
const ProfitReportContent = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Total Revenue</p>
        <p className="text-xl font-bold text-green-600">₹{(data?.summary?.totalRevenue || 0).toLocaleString()}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Total Cost</p>
        <p className="text-xl font-bold text-red-600">₹{(data?.summary?.totalCost || 0).toLocaleString()}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Gross Profit</p>
        <p className="text-xl font-bold text-primary-600">₹{(data?.summary?.grossProfit || 0).toLocaleString()}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Net Profit</p>
        <p className="text-xl font-bold text-primary-600">₹{(data?.summary?.netProfit || 0).toLocaleString()}</p>
      </div>
    </div>

    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-2">Profit Margin</p>
      <div className="flex items-center space-x-4">
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${Math.min(100, data?.summary?.margin || 0)}%` }}
          />
        </div>
        <span className="text-lg font-bold text-primary-600">{data?.summary?.margin?.toFixed(2) || 0}%</span>
      </div>
    </div>
  </div>
)

export default ReportViewer
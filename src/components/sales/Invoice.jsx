import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useReactToPrint } from 'react-to-print'
import { motion } from 'framer-motion'
import { PrinterIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format } from 'date-fns'
import Loader from '../common/Loader'

const Invoice = () => {
  const { id } = useParams()
  const printRef = useRef()

  const { data, isLoading } = useQuery({
    queryKey: ['sales', id],
    queryFn: () => api.get(`/sales/${id}`).then(res => res.data)
  })

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `invoice-${data?.data?.invoiceNo}`,
  })

  if (isLoading) return <Loader />

  const sale = data?.data

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Print Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="btn-primary inline-flex items-center"
        >
          <PrinterIcon className="h-5 w-5 mr-2" />
          Print Invoice
        </button>
      </div>

      {/* Invoice */}
      <div ref={printRef} className="bg-white rounded-xl shadow-card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-600 mb-2">FRUGANO</h1>
          <p className="text-gray-600 mb-4">Freshness Delivered Daily</p>
          <div className="border-t border-b border-gray-200 py-4">
            <h2 className="text-xl font-semibold">TAX INVOICE</h2>
            <p className="text-sm text-gray-500">Invoice #: {sale.invoiceNo}</p>
          </div>
        </div>

        {/* Store and Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Store Details:</h3>
            <p className="text-sm text-gray-600">Frugano Main Store</p>
            <p className="text-sm text-gray-600">123, Retail Street</p>
            <p className="text-sm text-gray-600">Mumbai - 400001</p>
            <p className="text-sm text-gray-600">GST: 27AAAAA0000A1Z5</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer Details:</h3>
            <p className="text-sm text-gray-600">{sale.customerName || 'Walk-in Customer'}</p>
            {sale.customerPhone && (
              <p className="text-sm text-gray-600">Phone: {sale.customerPhone}</p>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm text-gray-600">
          <div>
            <p><span className="font-medium">Date:</span> {format(new Date(sale.saleDate), 'dd/MM/yyyy')}</p>
            <p><span className="font-medium">Time:</span> {format(new Date(sale.saleDate), 'hh:mm a')}</p>
          </div>
          <div className="text-right">
            <p><span className="font-medium">Cashier:</span> {sale.cashier?.name || 'Unknown'}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-y border-gray-300">
              <th className="py-3 text-left text-sm font-semibold">Item</th>
              <th className="py-3 text-center text-sm font-semibold">Qty</th>
              <th className="py-3 text-right text-sm font-semibold">Price</th>
              <th className="py-3 text-right text-sm font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3 text-sm text-gray-700">{item.product?.name}</td>
                <td className="py-3 text-center text-sm text-gray-700">
                  {item.quantity} {item.product?.unit}
                </td>
                <td className="py-3 text-right text-sm text-gray-700">₹{item.sellingPrice}</td>
                <td className="py-3 text-right text-sm text-gray-700">₹{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{sale.subtotal}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">-₹{sale.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">₹{sale.taxAmount}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>TOTAL:</span>
              <span className="text-primary-600">₹{sale.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="border-t pt-4 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Payment Method:</span> {sale.paymentMethod}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          <p className="mb-1">Thank you for shopping with Frugano!</p>
          <p>This is a computer generated invoice - no signature required.</p>
          <p className="mt-4 text-xs">Terms & Conditions apply. Goods once sold will not be taken back.</p>
        </div>
      </div>
    </motion.div>
  )
}

export default Invoice
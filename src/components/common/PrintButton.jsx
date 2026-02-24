import { useState } from 'react'
import { PrinterIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PrintButton = ({ saleId, className = '' }) => {
  const [printing, setPrinting] = useState(false)

  const handlePrint = async () => {
    setPrinting(true)
    try {
      // Try to print directly via thermal printer
      const response = await api.post(`/print/invoice/${saleId}`).catch(() => {
        // Fallback to PDF download
        window.open(`/api/sales/${saleId}/print`, '_blank')
        return { data: { success: false } }
      })
      
      if (response?.data?.success) {
        toast.success('Invoice sent to printer')
      }
    } catch (error) {
      console.error('Print error:', error)
      // Fallback to PDF
      window.open(`/api/sales/${saleId}/print`, '_blank')
    } finally {
      setPrinting(false)
    }
  }

  return (
    <button
      onClick={handlePrint}
      disabled={printing}
      className={`btn-secondary inline-flex items-center ${className}`}
    >
      <PrinterIcon className="h-4 w-4 mr-2" />
      {printing ? 'Printing...' : 'Print Invoice'}
    </button>
  )
}

export default PrintButton
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/solid'

const TopProducts = ({ products = [] }) => {
  const navigate = useNavigate()

  if (!products || products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-card p-6 h-full dark:bg-gray-800"
      >
        <h2 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-4">
          Top Products
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No products data available</p>
        </div>
      </motion.div>
    )
  }

  const maxQuantity = Math.max(...products.map(p => p._sum?.quantity || 0))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-card p-6 h-full dark:bg-gray-800"
    >
      <h2 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-4">
        Top Selling Products
      </h2>

      <div className="space-y-4">
        {products.map((product, index) => {
          const quantity = product._sum?.quantity || 0
          const percentage = maxQuantity > 0 ? (quantity / maxQuantity) * 100 : 0

          return (
            <div key={product.productId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {index < 3 ? (
                      <StarIcon className={`h-4 w-4 ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-400' :
                        'text-orange-400'
                      }`} />
                    ) : (
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-4 text-center">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {quantity} units sold
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  ₹{(product._sum?.total || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-primary-100 dark:bg-primary-900">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 dark:bg-primary-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button 
        onClick={() => navigate('/products')}
        className="mt-6 w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
      >
        View All Products →
      </button>
    </motion.div>
  )
}

export default TopProducts
import { motion } from 'framer-motion'
import logoImage from '../../assets/images/logo.png'

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  // Size mappings
  const sizes = {
    sm: {
      container: 'w-8 h-8',
      text: 'text-lg',
    },
    md: {
      container: 'w-12 h-12',
      text: 'text-xl',
    },
    lg: {
      container: 'w-16 h-16',
      text: 'text-2xl',
    },
    xl: {
      container: 'w-24 h-24',
      text: 'text-3xl',
    },
  }

  const selectedSize = sizes[size] || sizes.md

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${selectedSize.container} relative overflow-hidden rounded-xl`}>
        <img 
          src={logoImage} 
          alt="Frugano Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span className={`font-heading font-semibold text-primary-600 dark:text-primary-400 ${selectedSize.text}`}>
          Frugano
        </span>
      )}
    </div>
  )
}

export default Logo
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import Logo from './Logo'

const Loader = ({ fullScreen = true }) => {
  const theme = useTheme()

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Logo */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Logo size="lg" showText={false} />
      </motion.div>

      {/* Loading Text */}
      <motion.p
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`${theme.text.secondary} font-medium mt-4`}
      >
        Loading...
      </motion.p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center`}>
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  )
}

export default Loader
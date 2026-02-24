import { useTheme } from '../../contexts/ThemeContext'

const Footer = () => {
  const theme = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`${theme.footer} border-t ${theme.border.primary} mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          {/* Copyright */}
          <p className={`text-sm ${theme.text.secondary}`}>
            © {currentYear} Frugano. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex space-x-6">
            <a 
              href="#" 
              className={`text-sm ${theme.text.secondary} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className={`text-sm ${theme.text.secondary} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className={`text-sm ${theme.text.secondary} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
            >
              Support
            </a>
          </div>

          {/* Version */}
          <p className={`text-sm ${theme.text.tertiary}`}>
            Version 1.0.0
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
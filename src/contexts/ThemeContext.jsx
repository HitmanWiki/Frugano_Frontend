import React, { createContext, useState, useContext, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(prev => !prev)

  // Complete color schemes for both themes
  const theme = {
    darkMode,
    toggleDarkMode,
    
    // Background colors
    bg: {
      primary: darkMode ? 'bg-gray-900' : 'bg-accent-cream',
      secondary: darkMode ? 'bg-gray-800' : 'bg-white',
      card: darkMode ? 'bg-gray-800' : 'bg-white',
      hover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
      active: darkMode ? 'bg-gray-700' : 'bg-gray-100',
    },
    
    // Text colors
    text: {
      primary: darkMode ? 'text-white' : 'text-gray-900',
      secondary: darkMode ? 'text-gray-400' : 'text-gray-600',
      tertiary: darkMode ? 'text-gray-500' : 'text-gray-400',
      inverse: darkMode ? 'text-gray-900' : 'text-white',
    },
    
    // Border colors
    border: {
      primary: darkMode ? 'border-gray-700' : 'border-gray-200',
      focus: darkMode ? 'focus:border-primary-400' : 'focus:border-primary-500',
      hover: darkMode ? 'hover:border-gray-600' : 'hover:border-gray-300',
    },
    
    // Component specific
    sidebar: darkMode ? 'bg-gray-800' : 'bg-white',
    header: darkMode ? 'bg-gray-800' : 'bg-white',
    footer: darkMode ? 'bg-gray-800' : 'bg-white',
    
    // Form inputs
    input: darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-primary-400 focus:border-primary-400' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500',
    
    // Table styles
    table: {
      header: darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600',
      row: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
      border: darkMode ? 'border-gray-700' : 'border-gray-200',
    },
    
    // Badges
    badge: {
      success: darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800',
      warning: darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      error: darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800',
      info: darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800',
    },
    
    // Buttons
    button: {
      primary: darkMode 
        ? 'bg-primary-600 hover:bg-primary-700 text-white' 
        : 'bg-primary-500 hover:bg-primary-600 text-white',
      secondary: darkMode 
        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      danger: darkMode 
        ? 'bg-red-600 hover:bg-red-700 text-white' 
        : 'bg-red-500 hover:bg-red-600 text-white',
    },
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useTheme } from '../../contexts/ThemeContext'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const theme = useTheme()

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Function to close sidebar
  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className={`min-h-screen ${theme.bg.primary} flex flex-col`}>
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - always visible on desktop, conditionally on mobile */}
        <div className={`
          ${sidebarOpen ? 'block' : 'hidden'} 
          lg:block lg:relative lg:translate-x-0
          fixed inset-y-0 left-0 z-50
        `}>
          <Sidebar 
            closeSidebar={closeSidebar}
          />
        </div>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  )
}

export default Layout
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Settings, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleHome = () => {
    navigate('/')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-sovereign-500 to-accent-500 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/20 transition-all hover:scale-105"
      >
        <span className="text-sm font-bold text-slate-900">
          {user?.name?.charAt(0)?.toUpperCase() || 'S'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 right-0 z-50 w-48 bg-[#0B0F19]/90 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="py-2">
              <div className="px-4 py-2 border-b border-slate-200 mb-1">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Creator'}</p>
                <p className="text-[10px] text-slate-600 truncate">{user?.email || 'creator@example.com'}</p>
              </div>

              <button 
                onClick={handleHome}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-800 transition-colors hover:bg-slate-200/50 hover:text-slate-900"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-800 transition-colors hover:bg-slate-200/50 hover:text-slate-900"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </button>
              
              <div className="border-t border-slate-200 my-1" />
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

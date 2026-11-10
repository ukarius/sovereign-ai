import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import RoleRoute from './components/RoleRoute'
import BrandDashboard from './pages/BrandDashboard'
import CreatorDashboard from './pages/CreatorDashboard'
import CollabNetworkPage from './pages/CollabNetworkPage'
import BrandDiscoveryPage from './pages/BrandDiscoveryPage'
import useAuthStore from './store/authStore'
import { Navigate } from 'react-router-dom'


// Helper component to redirect /dashboard to correct role dashboard
function DashboardRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth?mode=login" replace />
  return <Navigate to={user.role === 'BRAND' ? '/dashboard/brand' : '/dashboard/creator'} replace />
}

// Page transition wrapper
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: 'easeIn' as const } },
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

// Animated routes wrapper — uses useLocation for AnimatePresence
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        
        <Route element={<RoleRoute allowedRole="CREATOR" />}>
          <Route path="/dashboard/creator" element={<PageTransition><CreatorDashboard /></PageTransition>} />
          <Route path="/collabs" element={<PageTransition><CollabNetworkPage /></PageTransition>} />
        </Route>
        
        <Route element={<RoleRoute allowedRole="BRAND" />}>
          <Route path="/dashboard/brand" element={<PageTransition><BrandDashboard /></PageTransition>} />
          <Route path="/brand/discovery" element={<PageTransition><BrandDiscoveryPage /></PageTransition>} />
        </Route>

        {/* Fallback for creator landing pages via slug */}
        <Route path="/:slug" element={<PageTransition><LandingPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const isReady = useAuthStore((s) => s.isReady)

  // Validate stored JWT on app load
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Show nothing until auth check completes to prevent flash
  if (!isReady) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sovereign-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>

      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App

import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'

interface RoleRouteProps {
  allowedRole: 'CREATOR' | 'BRAND'
}

export default function RoleRoute({ allowedRole }: RoleRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated()) {
    return <Navigate to="/auth?mode=login" replace />
  }

  if (user?.role !== allowedRole) {
    // Redirect to their correct dashboard
    if (user?.role === 'BRAND') {
      return <Navigate to="/dashboard/brand" replace />
    } else {
      return <Navigate to="/dashboard/creator" replace />
    }
  }

  return <Outlet />
}

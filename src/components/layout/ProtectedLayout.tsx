import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { NAV_ITEMS, isModuleEnabled } from '@/lib/module-nav'
import { Sidebar } from './Sidebar'

export function ProtectedLayout() {
  const { user, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return null
  }

  if (!user) {
    return <Navigate to="/giris" replace />
  }

  const matchedNavItem = NAV_ITEMS.find((item) =>
    location.pathname.startsWith(item.path)
  )
  if (matchedNavItem && !isModuleEnabled(matchedNavItem, user.enabledModules)) {
    return <Navigate to="/panel" replace />
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

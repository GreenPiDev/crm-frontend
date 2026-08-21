import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { NAV_ITEMS, isModuleEnabled } from '@/lib/module-nav'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { user, logout } = useAuth()
  if (!user) return null

  const items = NAV_ITEMS.filter((item) =>
    isModuleEnabled(item, user.enabledModules)
  )

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-border bg-background">
      <div className="px-4 py-4">
        <span className="text-base font-semibold text-foreground">
          Nova CRM
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {items.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                isActive && 'bg-primary/10 text-primary'
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <p className="truncate px-1 text-xs text-muted-foreground">
          {user.email}
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}

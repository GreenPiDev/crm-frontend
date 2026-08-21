import { LayoutDashboard, Building2, Users, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Backend'deki module-catalog.ts'in frontend karşılığı: yeni bir modül
// eklerken burada bir satır eklenir. moduleKey'i olmayan öğeler (Panel,
// Ayarlar) her zaman görünür.
export type ModuleKey = 'accounts' | 'contacts'

export interface NavItem {
  key: string
  label: string
  path: string
  icon: LucideIcon
  moduleKey?: ModuleKey
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Panel', path: '/panel', icon: LayoutDashboard },
  {
    key: 'accounts',
    label: 'Firmalar',
    path: '/firmalar',
    icon: Building2,
    moduleKey: 'accounts',
  },
  {
    key: 'contacts',
    label: 'Kişiler',
    path: '/kisiler',
    icon: Users,
    moduleKey: 'contacts',
  },
  { key: 'settings', label: 'Ayarlar', path: '/ayarlar', icon: Settings },
]

export function isModuleEnabled(
  item: NavItem,
  enabledModules: string[]
): boolean {
  return !item.moduleKey || enabledModules.includes(item.moduleKey)
}

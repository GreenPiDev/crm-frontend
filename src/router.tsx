import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import AccountsPage from '@/pages/AccountsPage'
import ContactsPage from '@/pages/ContactsPage'
import SettingsPage from '@/pages/SettingsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/giris" element={<LoginPage />} />
      <Route path="/kayit" element={<RegisterPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/panel" element={<DashboardPage />} />
        <Route path="/firmalar" element={<AccountsPage />} />
        <Route path="/kisiler" element={<ContactsPage />} />
        <Route path="/ayarlar" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/panel" replace />} />
    </Routes>
  )
}

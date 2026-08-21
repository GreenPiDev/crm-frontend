import { useAuth } from '@/lib/auth-context'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground">Panel</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Hoş geldiniz, {user?.fullName}.
      </p>
    </div>
  )
}

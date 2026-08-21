import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { Switch } from '@/components/ui/switch'

interface TenantModuleStatus {
  key: string
  label: string
  enabled: boolean
}

export default function SettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isOwner = user?.role === 'OWNER'

  const { data: modules, isLoading } = useQuery({
    queryKey: ['tenant-modules'],
    queryFn: () => apiFetch<TenantModuleStatus[]>('/tenant-modules'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      apiFetch<TenantModuleStatus>(`/tenant-modules/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-modules'] })
    },
  })

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground">Ayarlar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Kiracınız için hangi modüllerin etkin olduğunu buradan yönetin.
      </p>

      <div className="mt-6 max-w-md divide-y divide-border rounded-lg border border-border bg-background">
        {isLoading && (
          <p className="px-4 py-3 text-sm text-muted-foreground">
            Yükleniyor...
          </p>
        )}

        {modules?.map((module) => (
          <div
            key={module.key}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-sm font-medium text-foreground">
              {module.label}
            </span>
            <Switch
              checked={module.enabled}
              disabled={!isOwner || toggleMutation.isPending}
              onCheckedChange={(checked) =>
                toggleMutation.mutate({ key: module.key, enabled: checked })
              }
              title={
                isOwner
                  ? undefined
                  : 'Sadece işletme sahibi değiştirebilir'
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}

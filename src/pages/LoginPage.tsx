import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/lib/auth-context'
import { ApiError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'

const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-posta zorunludur' })
    .email('Geçersiz e-posta adresi'),
  password: z
    .string({ required_error: 'Şifre zorunludur' })
    .min(1, 'Şifre zorunludur'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    try {
      await login(values.email, values.password)
      navigate('/panel')
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Giriş yapılamadı'
      )
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Nova CRM</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hesabınıza giriş yapın
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            Giriş Yap
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{' '}
          <Link to="/kayit" className="text-primary hover:underline">
            Kayıt olun
          </Link>
        </p>
      </div>
    </main>
  )
}

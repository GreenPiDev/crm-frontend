import { AuthProvider } from '@/lib/auth-context'
import { AppRouter } from './router'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App

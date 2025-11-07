'use client'

import { AuthProvider } from '@/lib/auth/auth-context'
import { ThemeProvider } from '@/lib/theme/theme-context'
import { GoogleOAuthProvider } from '@react-oauth/google'

export function Providers({ children }: { children: React.ReactNode }) {
  // Client ID do Google OAuth
  // Pode ser configurado via variável de ambiente NEXT_PUBLIC_GOOGLE_CLIENT_ID
  // ou usar o valor padrão abaixo
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
    '88439458045-aludq7rco9n42tc23pqvhpopki5bgbvm.apps.googleusercontent.com'

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  )
}







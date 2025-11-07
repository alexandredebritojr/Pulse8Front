'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Instagram } from 'lucide-react'

interface OAuthButtonsProps {
  onSuccess?: (userOrganizations?: any[]) => void
  onError?: (error: string) => void
  mode?: 'login' | 'register' // Modo de uso: login ou cadastro
  onOAuthData?: (data: { email: string; firstName: string; lastName: string; picture?: string; oauthProvider: string; oauthId: string }) => void
  onUserNotFound?: (oauthData: any) => void // Callback para quando usuário não encontrado
}

export function OAuthButtons({ onSuccess, onError, mode = 'login', onOAuthData, onUserNotFound }: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [googleOAuthError, setGoogleOAuthError] = useState<string | null>(null)
  const { loginWithGoogle } = useAuth()
  const router = useRouter()
  
  // Interceptar erros do console relacionados ao Google OAuth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Interceptar erros do console relacionados ao Google OAuth
      const originalError = console.error
      console.error = (...args: any[]) => {
        const errorMessage = args.join(' ')
        if (errorMessage.includes('GSI_LOGGER') && errorMessage.includes('origin is not allowed')) {
          setGoogleOAuthError('A origem não está autorizada no Google Cloud Console')
        }
        originalError.apply(console, args)
      }
      
      return () => {
        console.error = originalError
      }
    }
  }, [])

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true)
    let credential = credentialResponse.credential // Guardar credential para uso no catch
    
    try {
      if (!credential) {
        throw new Error('Credencial do Google não recebida')
      }

      // Decodificar o ID token do Google para obter informações do usuário
      const payload = JSON.parse(atob(credential.split('.')[1]))
      
      if (mode === 'register') {
        // Modo cadastro: validar OAuth e retornar dados para preencher o formulário
        console.log('🔐 OAuthButtons: Validando OAuth do Google para cadastro...')
        
        const { AuthService } = await import('@/lib/api/auth')
        const oauthData = await AuthService.validateGoogleOAuth({
          idToken: credential,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          givenName: payload.given_name,
          familyName: payload.family_name,
        })

        console.log('✅ OAuthButtons: Validação OAuth bem-sucedida!', oauthData)

        // Se usuário já existe, mostrar erro
        if (oauthData.userExists) {
          onError?.('Este email já está cadastrado. Faça login em vez de cadastrar.')
          return
        }

        // Passar dados OAuth para o componente pai preencher o formulário
        if (onOAuthData) {
          onOAuthData({
            email: oauthData.email,
            firstName: oauthData.firstName,
            lastName: oauthData.lastName,
            picture: oauthData.picture,
            oauthProvider: oauthData.oauthProvider,
            oauthId: oauthData.oauthId,
          })
        }
      } else {
        // Modo login: fazer login normalmente
        console.log('🔐 OAuthButtons: Fazendo login com Google OAuth...')
        
        try {
          // Usar a função do contexto de autenticação para manter consistência
          const result = await loginWithGoogle({
            idToken: credential,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            givenName: payload.given_name,
            familyName: payload.family_name,
          })

          console.log('✅ OAuthButtons: Login com Google bem-sucedido!')
          console.log('🏢 Organizações recebidas:', result.userOrganizations?.length || 0)

          // Chamar callback de sucesso passando as organizações
          // A página de login vai decidir se mostra o modal ou redireciona
          onSuccess?.(result.userOrganizations)
        } catch (loginError: any) {
          const errorMessage = loginError.message || 'Erro ao fazer login com Google'
          console.log('🔍 OAuthButtons: Erro capturado:', errorMessage)
          
          // Verificar se é erro de usuário não encontrado
          if (errorMessage.includes('USER_NOT_FOUND') || errorMessage.includes('não encontrado') || errorMessage.includes('Usuário não encontrado')) {
            console.log('✅ OAuthButtons: Usuário não encontrado - preparando redirecionamento para cadastro')
            
            // Preparar dados OAuth
            if (typeof window !== 'undefined' && credential) {
              try {
                const oauthData = {
                  email: payload.email,
                  firstName: payload.given_name || payload.name?.split(' ')[0] || '',
                  lastName: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '',
                  picture: payload.picture,
                  oauthProvider: 'Google',
                  oauthId: payload.sub || payload.email,
                }
                
                console.log('💾 OAuthButtons: Salvando dados OAuth no sessionStorage:', oauthData)
                
                // Salvar dados OAuth no sessionStorage
                sessionStorage.setItem('oauth-data', JSON.stringify(oauthData))
                
                // Chamar callback se disponível (para mostrar mensagem antes de redirecionar)
                if (onUserNotFound) {
                  console.log('📞 OAuthButtons: Chamando callback onUserNotFound')
                  onUserNotFound(oauthData)
                  // NÃO chamar onError aqui para evitar conflitos
                  return // Retornar sem propagar o erro
                } else {
                  // Se não tiver callback, mostrar erro e redirecionar após delay
                  console.log('⚠️ OAuthButtons: onUserNotFound não disponível, usando fallback')
                  onError?.('Usuário não encontrado. Redirecionando para cadastro...')
                  
                  // Redirecionar após um pequeno delay para o usuário ver a mensagem
                  setTimeout(() => {
                    console.log('🔄 OAuthButtons: Redirecionando para /register?oauth=google')
                    router.push('/register?oauth=google')
                  }, 2500)
                  return // Retornar sem propagar o erro
                }
              } catch (parseError) {
                console.error('❌ OAuthButtons: Erro ao processar dados OAuth para redirecionamento:', parseError)
                onError?.('Erro ao processar dados do Google. Tente novamente.')
                return
              }
            } else {
              console.error('❌ OAuthButtons: Window ou credential não disponível')
              onError?.('Erro ao processar dados do Google. Tente novamente.')
              return
            }
          }
          
          // Se não for erro de usuário não encontrado, propagar o erro
          console.error('❌ OAuthButtons: Erro não tratado:', loginError)
          throw loginError
        }
      }
    } catch (error: any) {
      console.error('❌ Erro no OAuth:', error)
      const errorMessage = error.message || `Erro ao fazer ${mode === 'register' ? 'validação' : 'login'} com Google`
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = (error?: any) => {
    console.error('❌ OAuthButtons: Erro do Google OAuth:', error)
    setGoogleOAuthError('Erro na configuração do Google OAuth. Verifique se a origem está autorizada no Google Cloud Console.')
    onError?.('Erro ao autenticar com Google. Verifique a configuração OAuth.')
  }

  const handleInstagramClick = () => {
    // Instagram OAuth requer configuração no Facebook Developer
    // Por enquanto, mostra uma mensagem informativa
    alert('Login com Instagram em breve! Por favor, use email/senha ou Google para entrar.')
    
    // Para implementar Instagram OAuth completo:
    // 1. Configurar app no Facebook Developer
    // 2. Redirecionar para: https://api.instagram.com/oauth/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=user_profile,user_media&response_type=code
    // 3. Trocar código por access token
    // 4. Obter informações do usuário
    // 5. Chamar AuthService.loginWithInstagram()
  }

  // Obter Client ID do Google (pode vir de variável de ambiente ou usar o padrão)
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
    '88439458045-aludq7rco9n42tc23pqvhpopki5bgbvm.apps.googleusercontent.com'

  if (!googleClientId) {
    console.warn('⚠️ Google Client ID não configurado. Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID nas variáveis de ambiente.')
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Ou continue com</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {googleClientId ? (
          <div className="flex flex-col items-center">
            {googleOAuthError && (
              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 text-center max-w-full">
                ⚠️ Configuração OAuth necessária
              </div>
            )}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                locale="pt-BR"
              />
            </div>
            {googleOAuthError && typeof window !== 'undefined' && (
              <p className="mt-1 text-xs text-gray-500 text-center max-w-full break-words">
                Adicione <code className="text-xs bg-gray-100 px-1 py-0.5 rounded break-all">{window.location.origin}</code> nas origens autorizadas do Google Cloud Console
              </p>
            )}
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => alert('Google OAuth não configurado. Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID.')}
            className="w-full"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleInstagramClick}
          className="w-full"
          disabled={isLoading}
        >
          <Instagram className="w-5 h-5 mr-2" />
          Instagram
        </Button>
      </div>
    </div>
  )
}


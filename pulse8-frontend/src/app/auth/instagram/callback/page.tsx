'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthService } from '@/lib/api/auth'

function InstagramCallbackPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obter código de autorização da URL
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (errorParam) {
          // Decodificar descrição do erro se necessário
          const decodedError = errorDescription 
            ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            : null
          
          // Verificar se é o erro "Invalid platform app"
          const isInvalidPlatformApp = errorParam === 'invalid_platform_app' || 
            decodedError?.includes('Invalid platform app') ||
            decodedError?.includes('Invalid platform') ||
            decodedError?.includes('Solicitação inválida')
          
          if (isInvalidPlatformApp) {
            const appId = typeof window !== 'undefined' 
              ? sessionStorage.getItem('instagram-oauth-app-id') || '1412398856657814'
              : '1412398856657814'
            const redirectUri = typeof window !== 'undefined'
              ? sessionStorage.getItem('instagram-oauth-redirect-uri') || 'http://localhost:3000/auth/instagram/callback'
              : 'http://localhost:3000/auth/instagram/callback'
            
            const domain = new URL(redirectUri).hostname
            const siteUrl = redirectUri.split('/auth')[0]
            
            const errorMessage = `❌ Erro de configuração: "Invalid platform app"

🔍 Este erro ocorre quando o app do Facebook não está configurado corretamente.

✅ PASSO 1: Configurar Plataforma "Website"
   1. Acesse: https://developers.facebook.com/apps/${appId}/settings/basic/
   2. Adicione a plataforma "Website"
   3. Configure URL do site: ${siteUrl}
   4. Adicione domínio: ${domain}

✅ PASSO 2: Configurar Redirect URI (CRÍTICO!)
   1. Acesse: https://developers.facebook.com/apps/${appId}/instagram-basic-display/basic-display/
   2. Role até "Valid OAuth Redirect URIs"
   3. Adicione: ${redirectUri}
   4. Salve as alterações

✅ PASSO 3: Adicionar Usuário de Teste (se app em desenvolvimento)
   1. Acesse: https://developers.facebook.com/apps/${appId}/roles/roles/
   2. Adicione seu Instagram como testador
   3. Aguarde o convite ser aceito

⏱️ Aguarde 5-10 minutos após salvar todas as alterações
🧹 Limpe o cache do navegador e cookies do Instagram
🔄 Tente novamente

Detalhes: ${decodedError || errorDescription}`
            
            setError(errorMessage)
            setIsLoading(false)
            return
          }
          
          setError(decodedError || errorDescription || 'Erro ao autorizar com Instagram')
          setIsLoading(false)
          return
        }

        if (!code) {
          setError('Código de autorização não recebido')
          setIsLoading(false)
          return
        }

        const redirectUri = typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/instagram/callback`
          : ''

        // Chamar backend para trocar código por token e obter dados do usuário
        // O backend faz a troca do código por token (mais seguro, pois o secret fica no backend)
        const { AuthService } = await import('@/lib/api/auth')
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:5001'
        
        const response = await fetch(`${backendUrl}/api/auth/oauth/instagram/exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirectUri,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Erro ao trocar código por token')
        }

        const data = await response.json()

        // Obter modo (login ou register) do sessionStorage
        const mode = typeof window !== 'undefined' 
          ? sessionStorage.getItem('instagram-oauth-mode') || 'login'
          : 'login'

        if (typeof window !== 'undefined') {
          if (mode === 'register') {
            // Modo register: validar OAuth e preencher dados
            try {
              const { AuthService } = await import('@/lib/api/auth')
              const oauthData = await AuthService.validateInstagramOAuth({
                accessToken: data.accessToken,
                userId: data.userId,
                username: data.username,
                accountType: data.accountType,
              })

              // Se usuário já existe, mostrar erro e redirecionar para login
              if (oauthData.userExists) {
                sessionStorage.setItem('oauth-error', 'Este usuário do Instagram já está cadastrado. Faça login em vez de cadastrar.')
                router.push('/login')
                return
              }

              // Salvar dados OAuth para preencher o cadastro
              sessionStorage.setItem('oauth-data', JSON.stringify({
                email: oauthData.email,
                firstName: oauthData.firstName,
                lastName: oauthData.lastName,
                picture: oauthData.picture,
                oauthProvider: oauthData.oauthProvider,
                oauthId: oauthData.oauthId,
              }))

              router.push('/register?oauth=instagram')
            } catch (err: any) {
              console.error('Erro ao validar OAuth do Instagram:', err)
              setError(err.message || 'Erro ao validar dados do Instagram')
              setIsLoading(false)
              return
            }
          } else {
            // Modo login: salvar dados e processar no login
            sessionStorage.setItem('instagram-oauth-data', JSON.stringify({
              accessToken: data.accessToken,
              userId: data.userId,
              username: data.username,
              accountType: data.accountType,
            }))

            router.push('/login?instagram_oauth=true')
          }
        }
      } catch (err: any) {
        console.error('Erro no callback do Instagram:', err)
        setError(err.message || 'Erro ao processar callback do Instagram')
        setIsLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processando autorização do Instagram...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const isConfigError = error.includes('Invalid platform app') || error.includes('configuração')
    const appId = typeof window !== 'undefined' 
      ? sessionStorage.getItem('instagram-oauth-app-id') || '1412398856657814'
      : '1412398856657814'
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className={`max-w-3xl w-full bg-white shadow-lg rounded-lg p-6 ${isConfigError ? 'border-2 border-yellow-400' : ''}`}>
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isConfigError ? 'Erro de Configuração do Instagram OAuth' : 'Erro na Autorização'}
            </h2>
            
            {isConfigError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4 text-left">
                <h3 className="font-bold text-red-800 mb-2">🔴 Ação Necessária:</h3>
                <p className="text-red-700 text-sm mb-3">
                  O erro &quot;Invalid platform app&quot; indica que o app do Facebook não está configurado corretamente. 
                  Siga os passos abaixo para resolver.
                </p>
              </div>
            )}
            
            <div className={`text-left mb-6 ${isConfigError ? 'bg-yellow-50 border border-yellow-200 rounded p-4' : 'bg-gray-50 border border-gray-200 rounded p-4'}`}>
              <pre className="whitespace-pre-wrap text-sm font-mono max-h-96 overflow-y-auto">{error}</pre>
            </div>
            
            {isConfigError && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-bold text-blue-800 mb-3">📋 Passos para Resolver (Clique nos links):</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-white rounded p-3 border border-blue-200">
                    <p className="font-semibold text-blue-700 mb-1">1️⃣ Configurar Redirect URI (CRÍTICO!):</p>
                    <a 
                      href={`https://developers.facebook.com/apps/${appId}/instagram-basic-display/basic-display/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      https://developers.facebook.com/apps/{appId}/instagram-basic-display/basic-display/
                    </a>
                    <p className="text-gray-600 text-xs mt-1">
                      → Role até &quot;Valid OAuth Redirect URIs&quot; → Adicione: <code className="bg-gray-100 px-1 rounded">http://localhost:3000/auth/instagram/callback</code>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3 border border-blue-200">
                    <p className="font-semibold text-blue-700 mb-1">2️⃣ Configurar Plataforma Website:</p>
                    <a 
                      href={`https://developers.facebook.com/apps/${appId}/settings/basic/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      https://developers.facebook.com/apps/{appId}/settings/basic/
                    </a>
                    <p className="text-gray-600 text-xs mt-1">
                      → Adicione plataforma &quot;Website&quot; → URL: <code className="bg-gray-100 px-1 rounded">http://localhost:3000</code>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3 border border-blue-200">
                    <p className="font-semibold text-blue-700 mb-1">3️⃣ Adicionar Usuário de Teste:</p>
                    <a 
                      href={`https://developers.facebook.com/apps/${appId}/roles/roles/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      https://developers.facebook.com/apps/{appId}/roles/roles/
                    </a>
                    <p className="text-gray-600 text-xs mt-1">
                      → Adicione seu Instagram como testador (se app em desenvolvimento)
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
                  <p className="text-xs text-yellow-800">
                    ⏱️ <strong>Após configurar:</strong> Aguarde 5-10 minutos, limpe o cache do navegador e cookies do Instagram, depois tente novamente.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/login')}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
              >
                ← Voltar para Login
              </button>
              {isConfigError && (
                <>
                  <button
                    onClick={() => {
                      window.open(`https://developers.facebook.com/apps/${appId}/instagram-basic-display/basic-display/`, '_blank')
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                  >
                    🔗 Abrir Redirect URI
                  </button>
                  <button
                    onClick={() => {
                      window.open(`https://developers.facebook.com/apps/${appId}/settings/basic/`, '_blank')
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
                  >
                    ⚙️ Abrir Configurações
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function InstagramCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processando autorização do Instagram...</p>
        </div>
      </div>
    }>
      <InstagramCallbackPageContent />
    </Suspense>
  )
}


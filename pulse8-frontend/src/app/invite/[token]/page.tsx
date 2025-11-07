'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Building2, Mail, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EventInvitesService, ValidateInviteTokenResponse } from '@/lib/api/invites'
import { AuthService, LoginRequest } from '@/lib/api/auth'
import { useAuth } from '@/lib/auth/auth-context'
import { formatDateTime } from '@/lib/utils'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const { user, login: authLogin, logout: authLogout } = useAuth()
  const token = params.token as string

  const [inviteData, setInviteData] = useState<ValidateInviteTokenResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleAcceptInvite = useCallback(async () => {
    console.log('🔘 Botão Aceitar Convite clicado', {
      token,
      hasInviteData: !!inviteData,
      isAccepted: inviteData?.isAccepted,
      isAccepting
    })

    if (!token) {
      console.error('❌ Token não fornecido')
      setError('Token de convite não fornecido')
      return
    }

    if (!inviteData) {
      console.error('❌ Dados do convite não disponíveis')
      setError('Dados do convite não disponíveis')
      return
    }

    // Se o convite tem email específico e já foi aceito, não pode ser usado novamente
    // Se o convite não tem email, pode ser usado múltiplas vezes mesmo se já foi aceito
    if (inviteData.invitedEmail && inviteData.isAccepted) {
      console.warn('⚠️ Convite com email já foi aceito')
      setError('Este convite já foi aceito')
      return
    }

    if (isAccepting) {
      console.warn('⚠️ Já está processando aceitação')
      return
    }

    setIsAccepting(true)
    setError('')
    
    try {
      console.log('📤 Enviando requisição para aceitar convite...')
      const response = await EventInvitesService.acceptInvite(token)
      console.log('✅ Convite aceito com sucesso:', response)
      
      // Atualizar estado apenas se o convite tem email específico
      // Convites sem email podem ser reutilizados, então não marcamos como aceito
      if (inviteData.invitedEmail) {
        setInviteData({
          ...inviteData,
          isAccepted: true
        })
      }
      
      // Redirecionar para a página de eventos após um breve delay
      console.log('🔄 Redirecionando para /events em 1 segundo...')
      setTimeout(() => {
        router.push('/events')
      }, 1000)
    } catch (err: any) {
      console.error('❌ Erro ao aceitar convite:', err)
      const errorMessage = err.message || 'Erro ao aceitar convite'
      setError(errorMessage)
      setIsAccepting(false)
    }
  }, [token, inviteData, isAccepting, router])

  // Validar token ao carregar a página
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token de convite não fornecido')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')
        const data = await EventInvitesService.validateInviteToken(token)
        console.log('📋 Dados do convite recebidos:', {
          eventName: data.eventName,
          invitedEmail: data.invitedEmail,
          hasInvitedEmail: !!data.invitedEmail
        })
        setInviteData(data)
      } catch (err: any) {
        console.error('❌ Erro ao validar token:', err)
        setError(err.message || 'Erro ao validar convite')
      } finally {
        setIsLoading(false)
      }
    }

    validateToken()
  }, [token])

  // Verificar se usuário está logado e se corresponde ao email do convite
  useEffect(() => {
    // Só verificar quando não estiver carregando e tiver os dados do convite
    if (isLoading) {
      console.log('⏳ Aguardando carregamento dos dados do convite...')
      return
    }

    if (!inviteData) {
      console.log('❌ Dados do convite não disponíveis')
      setIsLoggedIn(false)
      return
    }

    console.log('🔍 Verificando status de login:', {
      hasUser: !!user,
      userEmail: user?.email,
      invitedEmail: inviteData.invitedEmail,
      hasInvitedEmail: !!inviteData.invitedEmail,
      isLoading
    })

    if (user) {
      // Se o convite tem um email específico, verificar se corresponde ao usuário logado
      if (inviteData.invitedEmail) {
        // Se o email do convite corresponde ao email do usuário logado, está logado corretamente
        const userEmail = user.email?.toLowerCase().trim()
        const inviteEmail = inviteData.invitedEmail.toLowerCase().trim()
        console.log('🔍 Comparando emails:', {
          userEmail,
          inviteEmail,
          match: userEmail === inviteEmail
        })
        if (userEmail === inviteEmail) {
          console.log('✅ Email corresponde - usuário pode aceitar convite')
          setIsLoggedIn(true)
        } else {
          // Email diferente, não está logado para este convite
          console.log('❌ Email diferente - mostrar formulário de login')
          setIsLoggedIn(false)
        }
      } else {
        // Se o convite não tem email específico, qualquer usuário logado pode aceitar
        console.log('✅ Convite sem email específico - usuário pode aceitar')
        setIsLoggedIn(true)
      }
    } else {
      // Não há usuário logado
      console.log('❌ Nenhum usuário logado - mostrar formulário de login')
      setIsLoggedIn(false)
    }
  }, [user, inviteData, isLoading])

  // Pré-preencher email se o convite tiver um email específico
  useEffect(() => {
    if (inviteData?.invitedEmail && !email && !user) {
      setEmail(inviteData.invitedEmail)
    }
  }, [inviteData, email, user])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError('')

    try {
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()

      // Validação básica
      if (!trimmedEmail || !trimmedPassword) {
        setLoginError('Email e senha são obrigatórios')
        setIsLoggingIn(false)
        return
      }

      // Usar o contexto de autenticação para fazer login (ele já faz a validação e salva o token)
      if (authLogin) {
        await authLogin(trimmedEmail, trimmedPassword)
      } else {
        // Fallback: fazer login diretamente via AuthService
        const response = await AuthService.login({
          email: trimmedEmail,
          password: trimmedPassword
        })
        
        // Salvar token manualmente
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', response.token)
        }
      }

      // Limpar campos do formulário
      setEmail('')
      setPassword('')
      // O useEffect vai atualizar isLoggedIn automaticamente quando o user mudar
      // Após login bem-sucedido, o usuário precisa clicar no botão "Aceitar Convite" explicitamente
    } catch (err: any) {
      console.error('❌ Erro no login:', err)
      setLoginError(err.message || 'Erro ao fazer login')
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Validando convite...</p>
        </div>
      </div>
    )
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <XCircle className="h-6 w-6" />
              <CardTitle>Convite Inválido</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Ir para Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!inviteData) {
    return null
  }

  // Se já foi aceito E tem email específico (convites sem email podem ser reutilizados)
  if (inviteData.invitedEmail && inviteData.isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="h-6 w-6" />
              <CardTitle>Convite Já Aceito</CardTitle>
            </div>
            <CardDescription>
              Este convite já foi aceito anteriormente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/events">
              <Button className="w-full">Ver Eventos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se expirou
  if (inviteData.isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Convite Expirado</CardTitle>
            </div>
            <CardDescription>
              Este convite expirou em {formatDateTime(inviteData.expiresAt)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button variant="outline" className="w-full">Ir para Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se está aceitando
  if (isAccepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <CardTitle>Aceitando Convite</CardTitle>
            </div>
            <CardDescription>
              Aguarde enquanto processamos seu convite...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Informações do Convite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-indigo-600" />
              Convite para ser Promoter
            </CardTitle>
            <CardDescription>
              Você foi convidado(a) para ser Promoter de um evento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{inviteData.eventName}</p>
                  {inviteData.eventDescription && (
                    <p className="text-sm text-gray-600 mt-1">{inviteData.eventDescription}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Organização</p>
                  <p className="text-sm text-gray-600">{inviteData.organizationName}</p>
                </div>
              </div>

              {inviteData.inviteMessage && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Mensagem do organizador:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{inviteData.inviteMessage}</p>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Expira em</p>
                  <p className="text-sm text-gray-600">{formatDateTime(inviteData.expiresAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Login ou Botão de Aceitar */}
        {!isLoggedIn ? (
          <Card>
            <CardHeader>
              <CardTitle>Faça login para aceitar o convite</CardTitle>
              <CardDescription>
                {user && inviteData?.invitedEmail && user.email?.toLowerCase() !== inviteData.invitedEmail.toLowerCase() ? (
                  <>
                    Você está logado com um email diferente ({user.email}). 
                    {inviteData.invitedEmail && (
                      <> Este convite é para o email <strong>{inviteData.invitedEmail}</strong>. </>
                    )}
                    Faça logout e entre com o email correto, ou faça login abaixo.
                  </>
                ) : (
                  'Você precisa estar logado para aceitar este convite'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user && (
                <div className="mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (authLogout) {
                        authLogout()
                        setIsLoggedIn(false)
                      }
                    }}
                    className="w-full"
                  >
                    Fazer Logout
                  </Button>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{loginError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Fazendo login...
                    </>
                  ) : (
                    'Fazer Login'
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>Não tem uma conta?</p>
                  <Link href={`/register?inviteToken=${token}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Criar conta
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pronto para aceitar o convite?</CardTitle>
              <CardDescription>
                Clique no botão abaixo para aceitar e se tornar um Promoter deste evento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <Button 
                onClick={handleAcceptInvite} 
                className="w-full" 
                size="lg"
                disabled={isAccepting || !inviteData || (inviteData.invitedEmail && inviteData.isAccepted)}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Aceitando convite...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Aceitar Convite
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


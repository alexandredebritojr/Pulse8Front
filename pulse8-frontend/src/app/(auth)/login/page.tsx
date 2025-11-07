'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { User, Briefcase, Building2 } from 'lucide-react'
import { UserOrganizationInfo } from '@/lib/api/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [showRegisterTypeModal, setShowRegisterTypeModal] = useState(false)
  const [showOrganizationModal, setShowOrganizationModal] = useState(false)
  const [userOrganizations, setUserOrganizations] = useState<UserOrganizationInfo[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<string>('')
  const [isSelectingOrganization, setIsSelectingOrganization] = useState(false)
  const router = useRouter()
  
  console.log('🔍 LoginPage: Componente renderizado')
  
  const { login, user, updateUserOrganization } = useAuth()
  console.log('🔍 LoginPage: useAuth retornou:', { login: typeof login })

  // Função para traduzir status para português
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'Active': 'Ativo',
      'Inactive': 'Inativo',
      'Suspended': 'Suspenso',
      'Pending': 'Pendente'
    }
    return statusMap[status] || status
  }

  // Função para traduzir tipo de usuário para português
  const translateUserType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'Admin': 'Administrador',
      'Manager': 'Gerente',
      'Employee': 'Funcionário',
      'Promoter': 'Promoter'
    }
    return typeMap[type] || type
  }

  // Carregar dados salvos quando a página carrega
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('remembered-email')
      const savedRememberMe = localStorage.getItem('remember-me') === 'true'
      
      if (savedEmail && savedRememberMe) {
        setEmail(savedEmail)
        setRememberMe(true)
        console.log('💾 Dados salvos carregados:', { email: savedEmail, rememberMe: savedRememberMe })
      }
    }
  }, [])

  // Função para redirecionar baseado no tipo de usuário
  const redirectUser = useCallback((organizationId?: string, userOrganizationType?: number) => {
    if (!user) return
    
    // Atualizar organização no localStorage se fornecida
    if (organizationId) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('organizationId', organizationId)
        console.log('🏢 OrganizationId atualizado no localStorage:', organizationId)
      }
    }
    
    // Verificar o tipo de usuário e redirecionar
    // Promoter: userOrganizationType === 3 OU não tem organização nem userOrganizationType (cadastrado como promoter direto)
    const isPromoter = userOrganizationType === 3 || (!organizationId && !userOrganizationType)
    
    if (isPromoter) {
      // Promoter: sempre redirecionar para eventos (com ou sem organização)
      console.log('🔀 Redirecionando Promoter para /events', { organizationId, userOrganizationType })
      router.replace('/events')
    } else {
      // Outros usuários: redirecionar para dashboard
      console.log('🔀 Redirecionando para /dashboard', { organizationId, userOrganizationType })
      router.replace('/dashboard')
    }
  }, [user, router])

  // Redirecionar após login bem-sucedido baseado no tipo de usuário
  useEffect(() => {
    if (shouldRedirect && user) {
      redirectUser(user.organizationId, user.userOrganizationType)
      setShouldRedirect(false) // Resetar o flag
    }
  }, [shouldRedirect, user, redirectUser])

  // Handler para seleção de organização
  const handleOrganizationSelect = async () => {
    setError('')
    
    if (!selectedOrganization) {
      setError('Por favor, selecione uma organização')
      return
    }

    const selectedOrg = userOrganizations.find(org => org.organizationId === selectedOrganization)
    if (!selectedOrg) {
      setError('Organização selecionada não encontrada')
      return
    }

    setIsSelectingOrganization(true)
    try {
      console.log('✅ Organização selecionada:', selectedOrg)
      
      // Atualizar o contexto do usuário com a organização selecionada
      updateUserOrganization(
        selectedOrg.organizationId,
        selectedOrg.userOrganizationType,
        selectedOrg.userOrganizationTypeName
      )
      
      // Fechar modal e redirecionar
      setShowOrganizationModal(false)
      setError('')
      redirectUser(selectedOrg.organizationId, selectedOrg.userOrganizationType)
    } catch (err: any) {
      console.error('❌ Erro ao selecionar organização:', err)
      setError('Erro ao selecionar organização. Tente novamente.')
    } finally {
      setIsSelectingOrganization(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Formulário submetido!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    
    setIsLoading(true)
    setError('')

    try {
      // Validação básica no frontend
      if (!email || !password) {
        setError('Por favor, preencha todos os campos')
        setIsLoading(false)
        return
      }

      if (!email.includes('@')) {
        setError('Por favor, insira um email válido')
        setIsLoading(false)
        return
      }

      console.log('🔍 Tentando fazer login...')
      const loginResult = await login(email, password)
      console.log('✅ Login realizado com sucesso!')
      console.log('🏢 Organizações recebidas:', loginResult.userOrganizations?.length || 0)
      
      // Salvar dados se "Lembrar de mim" estiver marcado
      if (rememberMe) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('remembered-email', email)
          localStorage.setItem('remember-me', 'true')
          console.log('💾 Dados salvos para lembrar:', { email, rememberMe })
        }
      } else {
        // Limpar dados salvos se não quiser lembrar
        if (typeof window !== 'undefined') {
          localStorage.removeItem('remembered-email')
          localStorage.removeItem('remember-me')
          console.log('🗑️ Dados de lembrar removidos')
        }
      }
      
      // Verificar se o usuário tem múltiplas organizações
      if (loginResult.userOrganizations && loginResult.userOrganizations.length > 1) {
        // Mostrar modal de seleção de organização
        console.log('📋 Mostrando modal de seleção de organização')
        setUserOrganizations(loginResult.userOrganizations)
        setShowOrganizationModal(true)
        // Não redirecionar ainda - aguardar seleção do usuário
      } else {
        // Usuário sem organizações ou com apenas uma - seguir fluxo normal
        console.log('✅ Usuário sem múltiplas organizações - redirecionando')
        setShouldRedirect(true)
      }
    } catch (err: any) {
      console.error('❌ Erro no login:', err)
      // Exibir a mensagem de erro retornada pela API
      const errorMessage = err.message || 'Erro ao fazer login. Verifique suas credenciais e tente novamente.'
      setError(errorMessage)
      
      // Não redirecionar se houver erro - garantir que usuário veja a mensagem
      // O router.push só acontece se o login for bem-sucedido
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Faça login em sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <button
              type="button"
              onClick={() => setShowRegisterTypeModal(true)}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              crie uma nova conta
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  console.log('☑️ Lembrar de mim alterado:', e.target.checked)
                  setRememberMe(e.target.checked)
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Lembrar de mim
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Seleção de Tipo de Cadastro */}
      <Dialog open={showRegisterTypeModal} onOpenChange={setShowRegisterTypeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escolha o tipo de cadastro</DialogTitle>
            <DialogDescription>
              Selecione se você é um Promoter ou um Produtor de Eventos
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 px-6">
            <button
              onClick={() => {
                setShowRegisterTypeModal(false)
                router.push('/register?userType=promoter')
              }}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <User className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Promoter</h3>
              <p className="text-sm text-gray-600 text-center">
                Sou um promoter e quero me cadastrar para receber convites de eventos
              </p>
            </button>
            <button
              onClick={() => {
                setShowRegisterTypeModal(false)
                router.push('/register')
              }}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <Briefcase className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Produtor de Eventos</h3>
              <p className="text-sm text-gray-600 text-center">
                Sou um produtor e quero criar e gerenciar meus eventos
              </p>
            </button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegisterTypeModal(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção de Organização */}
      <Dialog open={showOrganizationModal} onOpenChange={setShowOrganizationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Selecione uma Organização
            </DialogTitle>
            <DialogDescription>
              Você possui acesso a múltiplas organizações. Por favor, selecione a organização com a qual deseja acessar o sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 px-6">
            <div className="space-y-2">
              <label htmlFor="organization-select" className="text-sm font-medium text-gray-700">
                Organização
              </label>
              <select
                id="organization-select"
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">Selecione uma organização</option>
                {userOrganizations.map((org) => (
                  <option key={org.organizationId} value={org.organizationId}>
                    {org.organizationName} - {translateUserType(org.userOrganizationTypeName)} ({translateStatus(org.status)})
                  </option>
                ))}
              </select>
            </div>
            {selectedOrganization && (
              <div className="p-3 bg-gray-50 rounded-md space-y-1">
                {(() => {
                  const selected = userOrganizations.find(org => org.organizationId === selectedOrganization)
                  if (!selected) return null
                  return (
                    <>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Tipo: </span>
                        <span className="text-gray-600">{translateUserType(selected.userOrganizationTypeName)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Status: </span>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          selected.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : selected.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {translateStatus(selected.status)}
                        </span>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowOrganizationModal(false)
                setSelectedOrganization('')
                setError('')
                // Fazer logout se cancelar
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('auth-token')
                  localStorage.removeItem('organizationId')
                  window.location.href = '/login'
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleOrganizationSelect}
              disabled={!selectedOrganization || isSelectingOrganization}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSelectingOrganization ? 'Entrando...' : 'Continuar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


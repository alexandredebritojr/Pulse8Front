'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const router = useRouter()
  
  console.log('🔍 LoginPage: Componente renderizado')
  
  const { login, user } = useAuth()
  console.log('🔍 LoginPage: useAuth retornou:', { login: typeof login })

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

  // Redirecionar após login bem-sucedido baseado no tipo de usuário
  useEffect(() => {
    if (shouldRedirect && user) {
      // Verificar o tipo de usuário e redirecionar
      if (user.userOrganizationType === 3) {
        // Promoter: redirecionar para eventos
        console.log('🔀 Redirecionando Promoter para /events', user)
        router.replace('/events')
      } else {
        // Outros usuários: redirecionar para dashboard
        console.log('🔀 Redirecionando para /dashboard', user)
        router.replace('/dashboard')
      }
      setShouldRedirect(false) // Resetar o flag
    }
  }, [shouldRedirect, user, router])

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
      await login(email, password)
      console.log('✅ Login realizado com sucesso!')
      
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
      
      // Marcar que deve redirecionar - o useEffect vai fazer o redirecionamento quando o user estiver disponível
      setShouldRedirect(true)
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
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              crie uma nova conta
            </Link>
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
    </div>
  )
}


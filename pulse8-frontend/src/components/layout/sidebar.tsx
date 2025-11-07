'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import React from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { useTheme } from '@/lib/theme/theme-context'
import {
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  Shield,
  FileText,
  Megaphone,
  UserCheck,
  Building,
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
  Receipt,
  TrendingUp,
  Image,
  Target,
  UserPlus,
  CheckSquare,
  ClipboardList,
  X,
  Sun,
  Moon,
  Lock,
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: any
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home 
  },
  {
    name: 'Eventos',
    href: '/events',
    icon: Calendar,
    children: [
      { name: 'Todos os Eventos', href: '/events', icon: Calendar },
      { name: 'Criar Evento', href: '/events/create', icon: Calendar },
    ]
  },
  {
    name: 'Financeiro',
    href: '/finance',
    icon: DollarSign,
    children: [
      { name: 'Visão Geral', href: '/finance', icon: BarChart3 },
      { name: 'Orçamento', href: '/finance/budget', icon: DollarSign },
      { name: 'Despesas', href: '/finance/expenses', icon: Receipt },
      { name: 'Receitas', href: '/finance/revenue', icon: TrendingUp },
    ]
  },
  {
    name: 'Calendário',
    href: '/calendar',
    icon: Calendar,
    children: [
      { name: 'Agenda', href: '/calendar', icon: Calendar },
      { name: 'Cronograma', href: '/calendar/schedules', icon: ClipboardList },
      { name: 'Timeline', href: '/calendar/timeline', icon: Calendar },
    ]
  },
  {
    name: 'Marketing',
    href: '/marketing',
    icon: Megaphone,
    children: [
      { name: 'Visão Geral', href: '/marketing', icon: Megaphone },
      { name: 'Campanhas', href: '/marketing/campaigns', icon: Target },
      { name: 'Assets', href: '/marketing/assets', icon: Image },
      { name: 'Posts', href: '/marketing/posts', icon: FileText },
      { name: 'Criar Campanha', href: '/marketing/create', icon: Megaphone },
    ]
  },
  {
    name: 'Equipe',
    href: '/team',
    icon: Users,
    children: [
      { name: 'Membros', href: '/team', icon: Users },
      { name: 'Adicionar Membro', href: '/team/create', icon: UserPlus },
    ]
  },
  {
    name: 'Promoters',
    href: '/promoters',
    icon: UserCheck,
    children: [
      { name: 'Todos os Promoters', href: '/promoters', icon: UserCheck },
      { name: 'Adicionar Promoter', href: '/promoters/create', icon: UserPlus },
    ]
  },
  {
    name: 'Convidados',
    href: '/guests',
    icon: Users,
    children: [
      { name: 'Todos os Convidados', href: '/guests', icon: Users },
      { name: 'Check-in', href: '/guests/checkin', icon: CheckSquare },
      { name: 'Adicionar Convidado', href: '/guests/create', icon: UserPlus },
    ]
  },
  {
    name: 'Fornecedores',
    href: '/suppliers',
    icon: Building,
    children: [
      { name: 'Todos os Fornecedores', href: '/suppliers', icon: Building },
      { name: 'Adicionar Fornecedor', href: '/suppliers/create', icon: Building },
    ]
  },
  {
    name: 'Relatórios',
    href: '/reports',
    icon: FileText,
    children: [
      { name: 'Visão Geral', href: '/reports', icon: FileText },
      { name: 'Eventos', href: '/reports/events', icon: Calendar },
      { name: 'Financeiro', href: '/reports/financial', icon: DollarSign },
      { name: 'Convidados', href: '/reports/guests', icon: Users },
      { name: 'Performance', href: '/reports/performance', icon: BarChart3 },
    ]
  },
  {
    name: 'Administração',
    href: '/admin',
    icon: Shield,
    children: [
      { name: 'Usuários', href: '/admin/users', icon: Users },
      { name: 'Alterar Senha', href: '/admin/change-password', icon: Lock },
    ]
  },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Verificar se o usuário é Promoter (UserOrganizationType = 3)
  // Também considerar como promoter se não tem organização nem userOrganizationType (cadastrado como promoter direto)
  // Usar useMemo para evitar recálculos desnecessários
  const isPromoter = useMemo(() => {
    return user?.userOrganizationType === 3 || (!user?.organizationId && !user?.userOrganizationType)
  }, [user?.userOrganizationType, user?.organizationId])

  // Filtrar navigation baseado no tipo de usuário usando useMemo para evitar recálculos desnecessários
  // Se o usuário ainda não foi carregado, mostrar todos os menus
  const filteredNavigation = useMemo(() => {
    if (isPromoter) {
      return navigation
        .filter(item => item.name === 'Eventos' || item.name === 'Administração')
        .map(item => {
          // Se for o item Eventos e o usuário for Promoter, remover "Criar Evento"
          if (item.name === 'Eventos' && item.children) {
            return {
              ...item,
              children: item.children.filter(child => child.name !== 'Criar Evento')
            }
          }
          // Se for Administração e o usuário for Promoter, mostrar apenas "Alterar Senha"
          if (item.name === 'Administração' && item.children) {
            return {
              ...item,
              children: item.children.filter(child => child.name === 'Alterar Senha')
            }
          }
          return item
        })
    }
    return navigation
  }, [isPromoter]) // Usar apenas isPromoter que já verifica se o usuário existe

  const handleLogout = () => {
    console.log('🚪 Sidebar: Botão sair clicado')
    logout()
    console.log('🔄 Sidebar: Redirecionando para login...')
    router.push('/login')
  }

  const handleLinkClick = () => {
    // Fechar menu mobile quando um link for clicado
    if (onClose) {
      onClose()
    }
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  // Auto-expand parent items when on a child page
  useEffect(() => {
    const autoExpandItems: string[] = []
    filteredNavigation.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => pathname === child.href)
        if (hasActiveChild && !autoExpandItems.includes(item.name)) {
          autoExpandItems.push(item.name)
        }
      }
    })
    
    if (autoExpandItems.length > 0) {
      setExpandedItems(prev => {
        const newExpanded = Array.from(new Set([...prev, ...autoExpandItems]))
        // Só atualizar se realmente mudou para evitar loops
        const prevSet = new Set(prev)
        const newSet = new Set(newExpanded)
        if (prevSet.size !== newSet.size || !Array.from(newSet).every(item => prevSet.has(item))) {
          return newExpanded
        }
        return prev
      })
    }
  }, [pathname, filteredNavigation]) // filteredNavigation está memoizado, então só muda quando user/isPromoter muda

  const isItemActive = (item: NavigationItem): boolean => {
    if (pathname === item.href) return true
    if (item.children) {
      return item.children.some(child => pathname === child.href)
    }
    return false
  }

  const isChildActive = (children: NavigationItem[]): boolean => {
    return children.some(child => pathname === child.href)
  }

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = isItemActive(item)
    const isExpanded = expandedItems.includes(item.name)
    const hasChildren = item.children && item.children.length > 0

    return (
      <li key={item.name}>
        <div>
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.name)}
              className={cn(
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                  : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 dark:text-gray-300 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/30',
                'group flex w-full items-center justify-between rounded-md p-2 text-sm leading-6 font-semibold'
              )}
            >
              <div className="flex items-center gap-x-3">
                <item.icon
                  className={cn(
                    isActive 
                      ? 'text-indigo-700 dark:text-indigo-300' 
                      : 'text-gray-400 group-hover:text-indigo-700 dark:text-gray-500 dark:group-hover:text-indigo-300',
                    'h-6 w-6 shrink-0'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                  : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 dark:text-gray-300 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/30',
                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
              )}
            >
              <item.icon
                className={cn(
                  isActive 
                    ? 'text-indigo-700 dark:text-indigo-300' 
                    : 'text-gray-400 group-hover:text-indigo-700 dark:text-gray-500 dark:group-hover:text-indigo-300',
                  'h-6 w-6 shrink-0'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <ul className="mt-1 ml-6 space-y-1">
            {item.children.map((child) => (
              <li key={child.name}>
                <Link
                  href={child.href}
                  onClick={handleLinkClick}
                  className={cn(
                    pathname === child.href
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                      : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/30',
                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium'
                  )}
                >
                  <child.icon
                    className={cn(
                      pathname === child.href 
                        ? 'text-indigo-700 dark:text-indigo-300' 
                        : 'text-gray-400 group-hover:text-indigo-700 dark:text-gray-500 dark:group-hover:text-indigo-300',
                      'h-5 w-5 shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900 shadow-lg">
      {/* Logo and Close button */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pulse8</h1>
        {/* Close button - only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation - with scroll */}
      <nav className="flex-1 overflow-y-auto px-6 py-4">
        <ul role="list" className="flex flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => renderNavigationItem(item))}
            </ul>
          </li>
        </ul>
      </nav>

      {/* User menu - fixed at bottom */}
      <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || 'Usuário'}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'usuario@exemplo.com'}</p>
          </div>
        </div>
        <button 
          onClick={toggleTheme}
          className="mt-4 flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="mr-3 h-4 w-4" />
              Modo Light
            </>
          ) : (
            <>
              <Moon className="mr-3 h-4 w-4" />
              Modo Dark
            </>
          )}
        </button>
        <button 
          onClick={handleLogout}
          className="mt-2 flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  )
}

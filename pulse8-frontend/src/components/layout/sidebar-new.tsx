'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import {
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  Settings,
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
      { name: 'Criar Campanha', href: '/marketing/create', icon: Megaphone },
    ]
  },
  {
    name: 'Equipe',
    href: '/team',
    icon: Users,
    children: [
      { name: 'Membros', href: '/team', icon: Users },
      { name: 'Cargos', href: '/team/roles', icon: Shield },
      { name: 'Adicionar Membro', href: '/team/create', icon: UserPlus },
    ]
  },
  {
    name: 'Promoters',
    href: '/promoters',
    icon: UserCheck,
    children: [
      { name: 'Todos os Promoters', href: '/promoters', icon: UserCheck },
      { name: 'Campanhas', href: '/promoters/campaigns', icon: Target },
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
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
    children: [
      { name: 'Geral', href: '/settings', icon: Settings },
      { name: 'Backup', href: '/settings/backup', icon: FileText },
      { name: 'Integrações', href: '/settings/integrations', icon: Building },
      { name: 'Segurança', href: '/settings/security', icon: Shield },
    ]
  },
  {
    name: 'Administração',
    href: '/admin',
    icon: Shield,
    children: [
      { name: 'Usuários', href: '/admin/users', icon: Users },
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const handleLogout = () => {
    console.log('🚪 Sidebar: Botão sair clicado')
    logout()
    console.log('🔄 Sidebar: Redirecionando para login...')
    router.push('/login')
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

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
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50',
                'group flex w-full items-center justify-between rounded-md p-2 text-sm leading-6 font-semibold'
              )}
            >
              <div className="flex items-center gap-x-3">
                <item.icon
                  className={cn(
                    isActive ? 'text-indigo-700' : 'text-gray-400 group-hover:text-indigo-700',
                    'h-6 w-6 shrink-0'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              className={cn(
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50',
                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
              )}
            >
              <item.icon
                className={cn(
                  isActive ? 'text-indigo-700' : 'text-gray-400 group-hover:text-indigo-700',
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
                  className={cn(
                    pathname === child.href
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50',
                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium'
                  )}
                >
                  <child.icon
                    className={cn(
                      pathname === child.href ? 'text-indigo-700' : 'text-gray-400 group-hover:text-indigo-700',
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
    <div className="flex h-full flex-col bg-white shadow-lg">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold text-gray-900">Pulse8</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-6 py-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => renderNavigationItem(item))}
            </ul>
          </li>
        </ul>
      </nav>

      {/* User menu */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500">{user?.email || 'usuario@exemplo.com'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="mt-4 flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Receipt, 
  PieChart,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface FinancialSummary {
  totalBudget: number
  totalExpenses: number
  totalRevenue: number
  profit: number
  pendingExpenses: number
  approvedExpenses: number
}

interface RecentExpense {
  id: string
  description: string
  amount: number
  category: string
  status: string
  date: string
  eventName: string
}

interface ChartData {
  month: string
  budget: number
  expenses: number
}

export default function FinancePage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockSummary: FinancialSummary = {
      totalBudget: 500000,
      totalExpenses: 320000,
      totalRevenue: 450000,
      profit: 130000,
      pendingExpenses: 25000,
      approvedExpenses: 295000,
    }

    const mockExpenses: RecentExpense[] = [
      {
        id: '1',
        description: 'Aluguel do espaço - Parque Ibirapuera',
        amount: 50000,
        category: 'Local',
        status: 'Aprovado',
        date: '2024-01-15',
        eventName: 'Festival de Verão 2024'
      },
      {
        id: '2',
        description: 'Equipamento de som profissional',
        amount: 25000,
        category: 'Equipamentos',
        status: 'Pendente',
        date: '2024-01-14',
        eventName: 'Festival de Verão 2024'
      },
      {
        id: '3',
        description: 'Marketing digital - Facebook/Instagram',
        amount: 15000,
        category: 'Marketing',
        status: 'Aprovado',
        date: '2024-01-13',
        eventName: 'Workshop Marketing Digital'
      },
      {
        id: '4',
        description: 'Segurança e vigilância',
        amount: 12000,
        category: 'Segurança',
        status: 'Pendente',
        date: '2024-01-12',
        eventName: 'Festival de Verão 2024'
      },
    ]

    const mockChartData: ChartData[] = [
      { month: 'Jan', budget: 120000, expenses: 85000 },
      { month: 'Fev', budget: 150000, expenses: 120000 },
      { month: 'Mar', budget: 180000, expenses: 140000 },
      { month: 'Abr', budget: 200000, expenses: 160000 },
      { month: 'Mai', budget: 220000, expenses: 180000 },
      { month: 'Jun', budget: 250000, expenses: 200000 },
      { month: 'Jul', budget: 280000, expenses: 220000 },
      { month: 'Ago', budget: 300000, expenses: 250000 },
      { month: 'Set', budget: 320000, expenses: 280000 },
      { month: 'Out', budget: 350000, expenses: 300000 },
      { month: 'Nov', budget: 380000, expenses: 320000 },
      { month: 'Dez', budget: 400000, expenses: 350000 }
    ]

    setTimeout(() => {
      setSummary(mockSummary)
      setRecentExpenses(mockExpenses)
      setChartData(mockChartData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-green-100 text-green-800'
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Rejeitado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Local':
        return '🏢'
      case 'Equipamentos':
        return '🎵'
      case 'Marketing':
        return '📢'
      case 'Segurança':
        return '🛡️'
      case 'Alimentação':
        return '🍽️'
      default:
        return '💰'
    }
  }

  const renderLineChart = () => {
    if (!chartData.length) return null

    const maxValue = Math.max(...chartData.map(d => Math.max(d.budget, d.expenses)))
    const chartWidth = 600
    const chartHeight = 300
    const padding = 40
    const innerWidth = chartWidth - (padding * 2)
    const innerHeight = chartHeight - (padding * 2)

    const getX = (index: number) => padding + (index * innerWidth / (chartData.length - 1))
    const getY = (value: number) => padding + innerHeight - (value / maxValue * innerHeight)

    const budgetPoints = chartData.map((d, i) => `${getX(i)},${getY(d.budget)}`).join(' ')
    const expensePoints = chartData.map((d, i) => `${getX(i)},${getY(d.expenses)}`).join(' ')

    return (
      <div className="w-full">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1={padding}
                y1={padding + (ratio * innerHeight)}
                x2={chartWidth - padding}
                y2={padding + (ratio * innerHeight)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={padding + (ratio * innerHeight) + 4}
                fontSize="12"
                fill="#6b7280"
                textAnchor="end"
              >
                {formatCurrency(maxValue * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {chartData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={chartHeight - 10}
              fontSize="12"
              fill="#6b7280"
              textAnchor="middle"
            >
              {d.month}
            </text>
          ))}

          {/* Budget line */}
          <polyline
            points={budgetPoints}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Expenses line */}
          <polyline
            points={expensePoints}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.map((d, i) => (
            <g key={i}>
              <circle
                cx={getX(i)}
                cy={getY(d.budget)}
                r="4"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
              <circle
                cx={getX(i)}
                cy={getY(d.expenses)}
                r="4"
                fill="#ef4444"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span className="text-sm text-gray-600">Orçamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500"></div>
            <span className="text-sm text-gray-600">Despesas</span>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamento & Financeiro</h1>
          <p className="text-gray-600">Controle financeiro completo dos seus eventos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/finance/expenses/create">
            <Button variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </Link>
          <Link href="/finance/revenue/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.totalBudget || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Valor total planejado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary?.totalExpenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary?.pendingExpenses || 0)} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas e ingressos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro</CardTitle>
            <PieChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary?.profit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(summary?.profit || 0) >= 0 ? 'Lucro' : 'Prejuízo'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas Recentes</CardTitle>
            <CardDescription>
              Últimas despesas registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-500">{expense.eventName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/finance/expenses">
                <Button variant="outline" className="w-full">
                  Ver todas as despesas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/finance/expenses">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Receipt className="h-6 w-6 mb-2" />
                  <span className="text-sm">Despesas</span>
                </Button>
              </Link>
              <Link href="/finance/revenue">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span className="text-sm">Receitas</span>
                </Button>
              </Link>
              <Link href="/finance/budget">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <PieChart className="h-6 w-6 mb-2" />
                  <span className="text-sm">Orçamento</span>
                </Button>
              </Link>
              <Link href="/finance/reports">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="text-sm">Relatórios</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Orçamento vs Despesas
          </CardTitle>
          <CardDescription>
            Comparação entre orçamento planejado e gastos reais ao longo do ano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            {renderLineChart()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


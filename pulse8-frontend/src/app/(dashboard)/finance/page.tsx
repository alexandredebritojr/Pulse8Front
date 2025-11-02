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
import { ExpensesService, ExpenseDto, ExpenseStatus } from '@/lib/api/expenses'
import { RevenueService, RevenueDto } from '@/lib/api/revenue'
import { BudgetService, BudgetDto } from '@/lib/api/budget'

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

const EXPENSE_TYPE_NAMES: Record<number, string> = {
  0: 'Local',
  1: 'Alimentação',
  2: 'Equipamentos',
  3: 'Marketing',
  4: 'Equipe',
  5: 'Transporte',
  6: 'Outros'
}

const EXPENSE_STATUS_NAMES: Record<number, string> = {
  0: 'Pendente',
  1: 'Pago',
  2: 'Atrasado',
  3: 'Cancelado'
}

export default function FinancePage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFinanceData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'

        // Buscar dados em paralelo
        const [expensesResponse, revenueResponse, budgetsResponse] = await Promise.all([
          ExpensesService.getExpenses({ 
            organizationId,
            pageSize: 1000 // Buscar todas para cálculo do summary
          }).catch(err => {
            console.error('Erro ao buscar despesas:', err)
            return { expenses: [], totalAmount: 0, paidAmount: 0, pendingAmount: 0 }
          }),
          RevenueService.getRevenue({ 
            organizationId,
            pageSize: 1000 // Buscar todas para cálculo do summary
          }).catch(err => {
            console.error('Erro ao buscar receitas:', err)
            return { revenues: [], totalAmount: 0 }
          }),
          BudgetService.getBudgets(organizationId, undefined, undefined, 1, 1000).catch(err => {
            console.error('Erro ao buscar orçamentos:', err)
            return { budgets: [] }
          })
        ])

        // Calcular total do orçamento
        let totalBudget = 0
        for (const budget of budgetsResponse.budgets) {
          totalBudget += budget.amount || 0
        }

        // Calcular totais de despesas
        let totalExpenses = expensesResponse.totalAmount || 0
        if (!expensesResponse.totalAmount && expensesResponse.expenses.length > 0) {
          for (const exp of expensesResponse.expenses) {
            totalExpenses += exp.amount || 0
          }
        }
        let pendingExpenses = expensesResponse.pendingAmount || 0
        if (!expensesResponse.pendingAmount) {
          for (const exp of expensesResponse.expenses.filter(exp => exp.status === ExpenseStatus.Pending)) {
            pendingExpenses += exp.amount || 0
          }
        }
        let approvedExpenses = expensesResponse.paidAmount || 0
        if (!expensesResponse.paidAmount) {
          for (const exp of expensesResponse.expenses.filter(exp => exp.status === ExpenseStatus.Paid)) {
            approvedExpenses += exp.amount || 0
          }
        }

        // Calcular total de receitas
        let totalRevenue = revenueResponse.totalAmount || 0
        if (!revenueResponse.totalAmount && revenueResponse.revenues.length > 0) {
          for (const rev of revenueResponse.revenues) {
            totalRevenue += rev.amount || 0
          }
        }

        // Calcular lucro
        const profit = totalRevenue - totalExpenses

        // Atualizar summary
        setSummary({
          totalBudget,
          totalExpenses,
          totalRevenue,
          profit,
          pendingExpenses,
          approvedExpenses
        })

        // Buscar despesas recentes (últimas 4, ordenadas por data mais recente)
        const recentExpensesData = expensesResponse.expenses
          .sort((a: ExpenseDto, b: ExpenseDto) => {
            const dateA = new Date(a.dueDate).getTime()
            const dateB = new Date(b.dueDate).getTime()
            return dateB - dateA // Mais recente primeiro
          })
          .slice(0, 4)
          .map((exp: ExpenseDto) => ({
            id: exp.id,
            description: exp.title,
            amount: exp.amount,
            category: EXPENSE_TYPE_NAMES[exp.type] || 'Outros',
            status: EXPENSE_STATUS_NAMES[exp.status] || 'Desconhecido',
            date: exp.dueDate,
            eventName: exp.eventName
          }))
        setRecentExpenses(recentExpensesData)

        // Gerar dados do gráfico baseado nos últimos 12 meses
        const now = new Date()
        const monthlyData: ChartData[] = []
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
          
          // Calcular despesas do mês
          const monthExpenses = expensesResponse.expenses
            .filter((exp: ExpenseDto) => {
              const expDate = new Date(exp.dueDate)
              return expDate.getMonth() === date.getMonth() && 
                     expDate.getFullYear() === date.getFullYear()
            })
            .reduce((sum: number, exp: ExpenseDto) => sum + exp.amount, 0)

          // Calcular orçamento do mês (soma dos budgets ativos no mês)
          const monthBudget = budgetsResponse.budgets
            .filter((budget: BudgetDto) => {
              const budgetStartDate = new Date(budget.startDate)
              const budgetEndDate = new Date(budget.endDate)
              return date >= budgetStartDate && date <= budgetEndDate
            })
            .reduce((sum: number, budget: BudgetDto) => {
              // Dividir o budget proporcionalmente pelos meses
              const budgetStartDate = new Date(budget.startDate)
              const budgetEndDate = new Date(budget.endDate)
              const budgetMonths = Math.max(1, Math.ceil((budgetEndDate.getTime() - budgetStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
              return sum + (budget.amount / budgetMonths)
            }, 0)

          monthlyData.push({
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            budget: monthBudget,
            expenses: monthExpenses
          })
        }

        setChartData(monthlyData)
      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err)
        setError('Erro ao carregar dados financeiros. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    }

    loadFinanceData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'bg-green-100 text-green-800'
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Atrasado':
        return 'bg-red-100 text-red-800'
      case 'Cancelado':
        return 'bg-gray-100 text-gray-800'
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Card className="p-6">
            <CardContent className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-lg font-medium text-gray-900">{error}</p>
              <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orçamento & Financeiro</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Controle financeiro completo dos seus eventos</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href="/finance/expenses/create">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Despesa</span>
            </Button>
          </Link>
          <Link href="/finance/revenue/create">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Receita</span>
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
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense) => (
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma despesa encontrada</p>
                </div>
              )}
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
                <Button className="h-20 w-full flex flex-col items-center justify-center">
                  <Receipt className="h-6 w-6 mb-2" />
                  <span className="text-sm">Despesas</span>
                </Button>
              </Link>
              <Link href="/finance/revenue">
                <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span className="text-sm">Receitas</span>
                </Button>
              </Link>
              <Link href="/finance/budget">
                <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center">
                  <PieChart className="h-6 w-6 mb-2" />
                  <span className="text-sm">Orçamento</span>
                </Button>
              </Link>
              <Link href="/finance/reports">
                <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center">
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


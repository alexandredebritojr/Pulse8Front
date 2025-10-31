'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Plus, 
  Save,
  Download,
  Filter,
  RefreshCw,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  Users,
  DollarSign,
  Activity,
  Zap,
  Settings,
  Trash2,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')

  // Mock data - em produção viria da API
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const templates = [
    { 
      id: 'financial-summary', 
      name: 'Resumo Financeiro', 
      description: 'Análise financeira completa com receita, despesas e lucro',
      icon: DollarSign,
      color: 'text-green-600'
    },
    { 
      id: 'guest-analysis', 
      name: 'Análise de Convidados', 
      description: 'Relatório detalhado de convidados e check-in',
      icon: Users,
      color: 'text-blue-600'
    },
    { 
      id: 'event-performance', 
      name: 'Performance de Eventos', 
      description: 'Métricas de performance e eficiência dos eventos',
      icon: Target,
      color: 'text-purple-600'
    },
    { 
      id: 'marketing-impact', 
      name: 'Impacto de Marketing', 
      description: 'Análise de campanhas e engajamento',
      icon: Activity,
      color: 'text-orange-600'
    },
    { 
      id: 'team-efficiency', 
      name: 'Eficiência da Equipe', 
      description: 'Métricas de produtividade e satisfação da equipe',
      icon: Zap,
      color: 'text-indigo-600'
    },
    { 
      id: 'supplier-analysis', 
      name: 'Análise de Fornecedores', 
      description: 'Performance e custos dos fornecedores',
      icon: Star,
      color: 'text-yellow-600'
    }
  ]

  const savedReports = [
    {
      id: '1',
      name: 'Relatório Mensal - Janeiro 2024',
      description: 'Análise completa do mês de janeiro',
      created: '2024-01-31',
      lastModified: '2024-01-31',
      type: 'financial-summary'
    },
    {
      id: '2',
      name: 'Performance Q1 2024',
      description: 'Relatório de performance do primeiro trimestre',
      created: '2024-03-31',
      lastModified: '2024-03-31',
      type: 'event-performance'
    },
    {
      id: '3',
      name: 'Análise de Convidados - Festival',
      description: 'Relatório específico do festival de verão',
      created: '2024-02-15',
      lastModified: '2024-02-15',
      type: 'guest-analysis'
    }
  ]

  const handleCreateReport = () => {
    if (!selectedTemplate || !reportName) {
      alert('Por favor, selecione um template e insira um nome para o relatório')
      return
    }
    
    setIsCreating(true)
    // Simular criação do relatório
    setTimeout(() => {
      setIsCreating(false)
      alert('Relatório criado com sucesso!')
    }, 2000)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios Personalizados</h1>
            <p className="text-gray-600">Crie e gerencie relatórios personalizados</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Create New Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Novo Relatório
          </CardTitle>
          <CardDescription>
            Selecione um template e configure seu relatório personalizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reportName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Relatório *
              </label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Ex: Relatório Mensal - Janeiro 2024"
              />
            </div>
            <div>
              <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <Input
                id="reportDescription"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Descrição do relatório"
              />
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecione um Template *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => {
                const IconComponent = template.icon
                return (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-6 w-6 ${template.color}`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleCreateReport}
              disabled={isCreating || !selectedTemplate || !reportName}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? 'Criando...' : 'Criar Relatório'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios Salvos
          </CardTitle>
          <CardDescription>
            Gerencie seus relatórios personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <p className="text-sm text-gray-500">{report.description}</p>
                      <div className="flex gap-4 text-xs text-gray-400 mt-1">
                        <span>Criado em {new Date(report.created).toLocaleDateString('pt-BR')}</span>
                        <span>Modificado em {new Date(report.lastModified).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesse funcionalidades avançadas de relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="text-sm">Gráficos</span>
            </Button>
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <Filter className="h-6 w-6 mb-2" />
              <span className="text-sm">Filtros</span>
            </Button>
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <Download className="h-6 w-6 mb-2" />
              <span className="text-sm">Exportar</span>
            </Button>
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-sm">Configurações</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Construtor de Relatórios
          </CardTitle>
          <CardDescription>
            Crie relatórios personalizados com métricas específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Métricas Disponíveis</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="metric-revenue" className="rounded" />
                  <label htmlFor="metric-revenue" className="text-sm">Receita Total</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="metric-guests" className="rounded" />
                  <label htmlFor="metric-guests" className="text-sm">Número de Convidados</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="metric-checkin" className="rounded" />
                  <label htmlFor="metric-checkin" className="text-sm">Taxa de Check-in</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="metric-satisfaction" className="rounded" />
                  <label htmlFor="metric-satisfaction" className="text-sm">Satisfação</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="metric-performance" className="rounded" />
                  <label htmlFor="metric-performance" className="text-sm">Performance</label>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Filtros</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Período</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>Últimos 30 dias</option>
                    <option>Últimos 90 dias</option>
                    <option>Último ano</option>
                    <option>Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Evento</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>Todos os eventos</option>
                    <option>Festa de Aniversário</option>
                    <option>Evento Corporativo</option>
                    <option>Festival de Verão</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tipo de Convidado</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>Todos os tipos</option>
                    <option>VIP</option>
                    <option>Standard</option>
                    <option>Staff</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


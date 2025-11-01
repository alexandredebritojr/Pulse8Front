'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  Award,
  Briefcase,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatPhone } from '@/lib/utils'
import { TeamService, PersonDto } from '@/lib/api/team'
import ConfirmationModal from '@/components/ui/confirmation-modal'

export default function TeamMemberDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [teamMember, setTeamMember] = useState<PersonDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const loadTeamMember = async () => {
      try {
        setIsLoading(true)
        setError('')
        const member = await TeamService.getTeamMemberById(params.id as string)
        setTeamMember(member)
      } catch (err: any) {
        console.error('❌ Erro ao carregar membro da equipe:', err)
        setError(err.message || 'Erro ao carregar membro da equipe')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (params.id) {
      loadTeamMember()
    }
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Inactive': return 'bg-red-100 text-red-800'
      case 'Suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return 'Ativo'
      case 'Inactive': return 'Inativo'
      case 'Suspended': return 'Suspenso'
      default: return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4" />
      case 'Inactive': return <AlertCircle className="h-4 w-4" />
      case 'Suspended': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getRoleInfo = (name: string) => {
    // Simular função baseada no nome
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    if (hash % 4 === 0) return { role: 'Admin', color: 'text-purple-600', icon: '👑' }
    if (hash % 4 === 1) return { role: 'Gerente', color: 'text-blue-600', icon: '👔' }
    if (hash % 4 === 2) return { role: 'Coordenador', color: 'text-green-600', icon: '🎯' }
    return { role: 'Staff', color: 'text-gray-600', icon: '👤' }
  }

  const getDepartmentInfo = (name: string) => {
    // Simular departamento baseado no nome
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    if (hash % 3 === 0) return 'Produção'
    if (hash % 3 === 1) return 'Marketing'
    return 'Operações'
  }

  const handleDelete = async () => {
    try {
      await TeamService.deleteTeamMember(teamMember!.id)
      setShowDeleteModal(false)
      router.push('/team')
    } catch (err: any) {
      console.error('❌ Erro ao excluir membro da equipe:', err)
      setError(err.message || 'Erro ao excluir membro da equipe')
    }
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
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <Button onClick={() => router.push('/team')}>Voltar</Button>
      </div>
    )
  }

  if (!teamMember) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Membro da equipe não encontrado</div>
        <Button onClick={() => router.push('/team')}>Voltar</Button>
      </div>
    )
  }

  const roleInfo = getRoleInfo(`${teamMember.firstName} ${teamMember.lastName}`)
  const department = getDepartmentInfo(`${teamMember.firstName} ${teamMember.lastName}`)

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/team')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{`${teamMember.firstName} ${teamMember.lastName}`}</h1>
            <p className="text-sm sm:text-base text-gray-600">{getStatusText(teamMember.status)}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/team/${teamMember.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          <Button 
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600 break-words">{teamMember.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Telefone</p>
                    <p className="text-sm text-gray-600 break-words">{formatPhone(teamMember.phone)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Endereço</p>
                    <p className="text-sm text-gray-600">N/A</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Função</p>
                  <p className="text-lg font-semibold">{roleInfo.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Departamento</p>
                  <p className="text-lg font-semibold">{department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Salário</p>
                  <p className="text-lg font-semibold text-green-600">R$ 5.500,00</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Início</p>
                  <p className="text-lg font-semibold">{formatDate(teamMember.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Habilidades e Competências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Gestão de Projetos', 'Marketing Digital', 'Vendas', 'Atendimento ao Cliente', 'Produção de Eventos', 'Design'].map(skill => (
                  <span key={skill} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estatísticas de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-gray-500">Projetos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">95%</div>
                  <div className="text-sm text-gray-500">Eficiência</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">4.8</div>
                  <div className="text-sm text-gray-500">Avaliação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">8</div>
                  <div className="text-sm text-gray-500">Eventos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Membro adicionado à equipe</p>
                    <p className="text-sm text-gray-500">{formatDate(teamMember.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Edit className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Informações atualizadas</p>
                    <p className="text-sm text-gray-500">{formatDate(teamMember.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Último projeto atribuído</p>
                    <p className="text-sm text-gray-500">Evento Corporativo - 3 dias atrás</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Projetos Este Mês</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Horas Trabalhadas</span>
                <span className="font-semibold">160h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Próximo Evento</span>
                <span className="font-semibold">15/01</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Avaliação Média</span>
                <span className="font-semibold text-green-600">4.8/5</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Atribuir Projeto
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Reunião
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Ver Salário
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Ligar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Ver no Mapa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Membro da Equipe"
        message="Tem certeza que deseja excluir este membro da equipe? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Award,
  CheckCircle,
  Users,
  Shield,
  Palette,
  Calendar,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { RolesService, RoleDto } from '@/lib/api/roles'
import ConfirmationModal from '@/components/ui/confirmation-modal'

export default function RoleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [role, setRole] = useState<RoleDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const roleId = params.id as string

  useEffect(() => {
    const loadRole = async () => {
      try {
        console.log('🔍 Carregando role:', roleId)
        const roleData = await RolesService.getRoleById(roleId)
        console.log('✅ Role carregado:', roleData)
        setRole(roleData)
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar role:', err)
        setError(err.message || 'Erro ao carregar role')
      } finally {
        setIsLoading(false)
      }
    }

    if (roleId) {
      loadRole()
    }
  }, [roleId])

  const handleEdit = () => {
    router.push(`/team/roles/${roleId}/edit`)
  }

  const handleDelete = async () => {
    try {
      console.log('🗑️ Excluindo role:', roleId)
      await RolesService.deleteRole(roleId)
      console.log('✅ Role excluído com sucesso')
      router.push('/team/roles')
    } catch (err: any) {
      console.error('❌ Erro ao excluir role:', err)
      setError(err.message || 'Erro ao excluir role')
    } finally {
      setShowDeleteModal(false)
    }
  }

  const getStatusColor = (isSystemRole: boolean) => {
    return isSystemRole
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800'
  }

  const getStatusText = (isSystemRole: boolean) => {
    return isSystemRole ? 'Sistema' : 'Personalizado'
  }

  const getStatusIcon = (isSystemRole: boolean) => {
    return isSystemRole
      ? <Award className="h-4 w-4" />
      : <CheckCircle className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/team/roles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/team/roles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detalhes da Função</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/team/roles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detalhes da Função</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <p>Função não encontrada</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/team/roles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{role.name}</h1>
            <p className="text-gray-500">Detalhes da função</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteModal(true)} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Role Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Informações da Função
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <p className="text-lg font-semibold">{role.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(role.isSystemRole)}>
                      {getStatusIcon(role.isSystemRole)}
                      <span className="ml-1">{getStatusText(role.isSystemRole)}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nível de Acesso</label>
                  <p className="text-lg font-semibold">{role.accessLevel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Usuários</label>
                  <p className="text-lg font-semibold">{role.userCount}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Descrição</label>
                <p className="mt-1 text-gray-700">{role.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Color Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Identidade Visual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-200 shadow-sm" 
                  style={{ backgroundColor: role.color }}
                ></div>
                <div>
                  <p className="font-medium">Cor da Função</p>
                  <p className="text-sm text-gray-500">{role.color}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Criado em</label>
                <p className="text-sm">{formatDate(role.createdAt)}</p>
              </div>
              {role.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Atualizado em</label>
                  <p className="text-sm">{formatDate(role.updatedAt)}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">ID da Organização</label>
                <p className="text-sm font-mono text-gray-600">{role.organizationId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Ver Usuários
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Gerenciar Permissões
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Função"
        message={`Tem certeza que deseja excluir a função "${role.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}

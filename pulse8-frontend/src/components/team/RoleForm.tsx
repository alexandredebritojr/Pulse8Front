'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Award, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import BaseForm from '@/components/ui/base-form'
import { RolesService, RoleDto } from '@/lib/api/roles'

interface RoleFormProps {
  mode: 'create' | 'edit'
  roleId?: string
}

export default function RoleForm({ mode, roleId }: RoleFormProps) {
  const router = useRouter()
  const [role, setRole] = useState<RoleDto | null>(null)
  const [isLoading, setIsLoading] = useState(mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#000000',
    accessLevel: 1,
    isSystemRole: false
  })

  useEffect(() => {
    if (mode === 'edit' && roleId) {
      const loadRole = async () => {
        try {
          console.log('🔍 Carregando role para edição:', roleId)
          const roleData = await RolesService.getRoleById(roleId)
          console.log('✅ Role carregado:', roleData)
          setRole(roleData)
          setFormData({
            name: roleData.name,
            description: roleData.description,
            color: roleData.color,
            accessLevel: roleData.accessLevel,
            isSystemRole: roleData.isSystemRole
          })
          setError('')
        } catch (err: any) {
          console.error('❌ Erro ao carregar role:', err)
          setError(err.message || 'Erro ao carregar role')
        } finally {
          setIsLoading(false)
        }
      }
      loadRole()
    }
  }, [mode, roleId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      if (mode === 'create') {
        console.log('💾 Criando novo role:', formData)
        const newRole = await RolesService.createRole({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          accessLevel: formData.accessLevel,
          isSystemRole: formData.isSystemRole
        })
        console.log('✅ Role criado com sucesso:', newRole)
        router.push('/team/roles')
      } else {
        console.log('💾 Salvando alterações do role:', formData)
        await RolesService.updateRole({
          id: roleId!,
          name: formData.name,
          description: formData.description,
          color: formData.color,
          accessLevel: formData.accessLevel,
          isSystemRole: formData.isSystemRole
        })
        console.log('✅ Role atualizado com sucesso')
        router.push(`/team/roles/${roleId}`)
      }
    } catch (err: any) {
      console.error('❌ Erro ao salvar role:', err)
      setError(err.message || 'Erro ao salvar alterações')
    } finally {
      setIsSaving(false)
    }
  }

  const getTitle = () => mode === 'create' ? 'Nova Função' : 'Editar Função'
  const getSubtitle = () => mode === 'create' 
    ? 'Adicione uma nova função ao sistema' 
    : 'Atualize as informações da função'
  const getBackUrl = () => mode === 'create' ? '/team/roles' : `/team/roles/${roleId}`

  const formContent = (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
          <CardDescription>
            Dados principais da função
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da função"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da função"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Nível de Acesso *
              </label>
              <Select
                value={formData.accessLevel.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, accessLevel: parseInt(value) }))}
              >
                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Básico</SelectItem>
                  <SelectItem value="2">2 - Intermediário</SelectItem>
                  <SelectItem value="3">3 - Avançado</SelectItem>
                  <SelectItem value="4">4 - Administrador</SelectItem>
                  <SelectItem value="5">5 - Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Cor da Função
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#000000"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Configurações
          </CardTitle>
          <CardDescription>
            Opções e configurações da função
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="isSystemRole" className="text-sm font-medium text-gray-700">
                Função do Sistema
              </label>
              <p className="text-xs text-gray-500">
                Funções do sistema não podem ser excluídas
              </p>
            </div>
            <Switch
              id="isSystemRole"
              checked={formData.isSystemRole}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSystemRole: checked }))}
              disabled={mode === 'edit' && role?.isSystemRole}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações Atuais - Only for edit mode */}
      {mode === 'edit' && role && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informações Atuais
            </CardTitle>
            <CardDescription>
              Dados atuais da função
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Usuários:</span>
              <span className="font-medium">{role.userCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Criado em:</span>
              <span className="font-medium">{new Date(role.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            {role.updatedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Atualizado em:</span>
                <span className="font-medium">{new Date(role.updatedAt).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <BaseForm
      mode={mode}
      title={getTitle()}
      subtitle={getSubtitle()}
      backUrl={getBackUrl()}
      isSaving={isSaving}
      error={error}
      onSubmit={handleSubmit}
    >
      {formContent}
    </BaseForm>
  )
}

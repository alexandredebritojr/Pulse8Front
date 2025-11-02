'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TeamService, CreateTeamMemberRequest } from '@/lib/api/team'
import { EventsService, EventDto } from '@/lib/api/events'
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft } from 'lucide-react'

interface TeamFormProps {
  mode: 'create' | 'edit'
  teamMemberId?: string
  eventId?: string
}

// Função para mascarar telefone: (00) 00000-0000 ou (00) 0000-0000
const maskPhone = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Aplica máscara: (00) 00000-0000 ou (00) 0000-0000
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }
}

// Função para mascarar CPF: 000.000.000-00
const maskCPF = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Aplica máscara: 000.000.000-00 (11 dígitos)
  if (numbers.length <= 3) {
    return numbers
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }
}

export default function TeamForm({ mode, teamMemberId, eventId }: TeamFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [events, setEvents] = useState<EventDto[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    document: '',
    pixKey: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    birthDate: '',
    profilePicture: '',
    role: '',
    status: 'Active',
    eventId: eventId || '',
  })

  // Função auxiliar para redirecionamento baseado no contexto
  const handleGoBack = () => {
    // Usar eventId da prop ou do formData (que pode ter vindo do membro carregado)
    const currentEventId = eventId || formData.eventId
    
    if (currentEventId) {
      router.push(`/events/${currentEventId}/edit?tab=team`)
    } else {
      router.push('/team')
    }
  }

  // Atualizar eventId quando prop mudar
  useEffect(() => {
    if (eventId) {
      setFormData(prev => ({ ...prev, eventId: eventId }))
    }
  }, [eventId])

  // Carregar eventos da API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true)
        setError('')
        
        const eventsResponse = await EventsService.getEvents({ pageSize: 100 })
        
        setEvents(eventsResponse.events)
      } catch (err: any) {
        console.error('❌ Erro ao carregar eventos:', err)
        setError(err.message || 'Erro ao carregar eventos')
      } finally {
        setIsLoadingEvents(false)
      }
    }

    loadEvents()
  }, [])

  useEffect(() => {
    if (mode === 'edit' && teamMemberId) {
      const loadTeamMember = async () => {
        try {
          console.log('🔍 TeamForm: Carregando membro da equipe para edição...')
          const teamMember = await TeamService.getTeamMemberById(teamMemberId)
          console.log('✅ TeamForm: Membro da equipe carregado:', teamMember)
          
          setFormData({
            firstName: teamMember.firstName,
            lastName: teamMember.lastName,
            email: teamMember.email,
            phone: teamMember.phone ? maskPhone(teamMember.phone) : '',
            document: teamMember.document ? maskCPF(teamMember.document) : '',
            pixKey: teamMember.pixKey || '',
            address: teamMember.address || '',
            city: teamMember.city || '',
            state: teamMember.state || '',
            zipCode: teamMember.zipCode || '',
            birthDate: teamMember.birthDate ? teamMember.birthDate.split('T')[0] : '',
            profilePicture: teamMember.profilePicture || '',
            role: teamMember.role || '',
            status: getStatusString(teamMember.status),
            eventId: teamMember.eventId || '',
          })
        } catch (err: any) {
          console.error('❌ TeamForm: Erro ao carregar membro da equipe:', err)
          setError(err.message || 'Erro ao carregar membro da equipe')
        }
      }
      
      loadTeamMember()
    }
  }, [mode, teamMemberId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    let maskedValue = value
    
    // Aplica máscara para campos específicos
    if (type !== 'checkbox') {
      if (name === 'phone') {
        maskedValue = maskPhone(value)
      } else if (name === 'document') {
        maskedValue = maskCPF(value)
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : maskedValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🔍 TeamForm: Iniciando operação...')
      console.log('🔍 TeamForm: mode =', mode)
      console.log('🔍 TeamForm: formData =', formData)
      
      // Preparar dados para a API (remover máscaras)
      const teamMemberData: CreateTeamMemberRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''), // Remove tudo que não é número
        document: formData.document.replace(/\D/g, ''), // Remove tudo que não é número
        pixKey: formData.pixKey,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
        profilePicture: formData.profilePicture,
        role: formData.role,
        status: formData.status || 'Active', // Garantir que sempre tenha um status válido (Active por padrão)
        eventId: formData.eventId || localStorage.getItem('currentEventId') || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      }
      
      console.log('🔍 TeamForm: teamMemberData.status =', teamMemberData.status)
      
      if (mode === 'create') {
        console.log('🔍 TeamForm: Criando novo membro da equipe...')
        const newId = await TeamService.createTeamMember(teamMemberData)
        console.log('✅ TeamForm: Membro da equipe criado com ID:', newId)
        // Redirecionar usando a função auxiliar
        handleGoBack()
      } else if (mode === 'edit' && teamMemberId) {
        console.log('🔍 TeamForm: Atualizando membro da equipe...')
        await TeamService.updateTeamMember(teamMemberId, teamMemberData)
        console.log('✅ TeamForm: Membro da equipe atualizado')
        // Redirecionar usando a função auxiliar (verifica eventId)
        handleGoBack()
      }
    } catch (err: any) {
      console.error('❌ TeamForm: Erro na operação:', err)
      setError(err.message || 'Erro ao salvar membro da equipe')
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: 'Active', label: 'Ativo' },
    { value: 'Inactive', label: 'Inativo' },
    { value: 'Suspended', label: 'Suspenso' }
  ]

  const getStatusValue = (status: string): number => {
    switch (status) {
      case 'Active': return 0
      case 'Inactive': return 1
      case 'Suspended': return 2
      default: return 0
    }
  }

  const getStatusString = (status: number | string): string => {
    if (typeof status === 'string') {
      return status
    }
    switch (status) {
      case 0: return 'Active'
      case 1: return 'Inactive'
      case 2: return 'Suspended'
      default: return 'Active'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Adicionar Membro da Equipe' : 'Editar Membro da Equipe'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Adicione um novo membro à equipe' 
              : 'Edite as informações do membro da equipe'
            }
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados principais do membro da equipe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Nome"
                  required
                />
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Sobrenome"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                Documento *
              </label>
                  <Input
                id="document"
                name="document"
                value={formData.document}
                    onChange={handleChange}
                placeholder="Ex: 123.456.789-00"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                  placeholder="Ex: joao@empresa.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                  placeholder="Ex: (11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                  <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento
                    </label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                      onChange={handleChange}
              />
                </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Função
                    </label>
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="Ex: Promotor, Organizador, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
                      Evento *
                    </label>
                    <select
                      id="eventId"
                      name="eventId"
                      value={formData.eventId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Selecione um evento</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                </div>
              </CardContent>
            </Card>

        {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
              Informações de Contato
                </CardTitle>
                <CardDescription>
              Endereço e dados de localização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                placeholder="Ex: Rua das Flores, 123"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                  placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                  placeholder="Ex: SP"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                  placeholder="Ex: 01234-567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

        {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações Financeiras
                </CardTitle>
                <CardDescription>
              Dados de pagamento e chave PIX
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div>
              <label htmlFor="pixKey" className="block text-sm font-medium text-gray-700 mb-1">
                Chave PIX
                    </label>
                    <Input
                id="pixKey"
                name="pixKey"
                value={formData.pixKey}
                      onChange={handleChange}
                placeholder="Ex: joao@empresa.com ou 123.456.789-00"
                    />
                  </div>

                  <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
                URL da Foto de Perfil
                    </label>
                    <Input
                id="profilePicture"
                name="profilePicture"
                value={formData.profilePicture}
                      onChange={handleChange}
                placeholder="Ex: https://exemplo.com/foto.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={handleGoBack}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {mode === 'create' ? (isLoading ? 'Criando...' : 'Criar Membro') : (isLoading ? 'Salvando...' : 'Salvar Alterações')}
          </Button>
        </div>
      </form>
    </div>
  )
}
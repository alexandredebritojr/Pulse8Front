'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, User, Phone, Mail, MapPin, Calendar, Heart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GuestsService, CreateGuestRequest, GuestDto } from '@/lib/api/guests'
import { EventsService, EventDto } from '@/lib/api/events'

interface GuestFormProps {
  mode: 'create' | 'edit'
  guestId?: string
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

export default function GuestForm({ mode, guestId, eventId }: GuestFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [events, setEvents] = useState<EventDto[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    eventId: eventId || '',
  })

  // Função auxiliar para redirecionamento baseado no contexto
  const handleGoBack = () => {
    if (eventId) {
      router.push(`/events/${eventId}/edit?tab=guest`)
    } else {
      router.push('/guests')
    }
  }

  // Atualizar eventId quando prop mudar
  useEffect(() => {
    if (eventId) {
      setFormData(prev => ({ ...prev, eventId: eventId }))
    }
  }, [eventId])

  // Carregar eventos
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true)
        console.log('🔍 GuestForm: Carregando eventos...')
        const response = await EventsService.getEvents({ pageSize: 100 })
        console.log('✅ GuestForm: Eventos carregados:', response.events)
        setEvents(response.events)
      } catch (err: any) {
        console.error('❌ GuestForm: Erro ao carregar eventos:', err)
        setError(err.message || 'Erro ao carregar eventos')
      } finally {
        setIsLoadingEvents(false)
      }
    }
    
    loadEvents()
  }, [])

  // Carregar dados do guest para edição
  useEffect(() => {
    if (mode === 'edit' && guestId) {
      const loadGuest = async () => {
        try {
          console.log('🔍 GuestForm: Carregando guest para edição...')
          console.log('🔍 GuestForm: guestId =', guestId)
          const guest = await GuestsService.getGuestById(guestId)
          console.log('✅ GuestForm: Guest carregado:', guest)
          console.log('🔍 GuestForm: guest.name =', guest.name)
          
          const newFormData = {
            name: guest.name,
            email: guest.email,
            phone: guest.phone ? maskPhone(guest.phone) : '',
            document: guest.document ? maskCPF(guest.document) : '',
            eventId: guest.eventId,
          }
          console.log('🔍 GuestForm: Definindo formData:', newFormData)
          setFormData(newFormData)
          
          // Verificar se o estado foi atualizado após um pequeno delay
          setTimeout(() => {
            console.log('🔍 GuestForm: Verificando formData após setState...')
          }, 100)
        } catch (err: any) {
          console.error('❌ GuestForm: Erro ao carregar guest:', err)
          setError(err.message || 'Erro ao carregar guest')
        }
      }
      
      loadGuest()
    }
  }, [mode, guestId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    console.log('🔍 GuestForm: handleChange - name:', name, 'value:', value)
    
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
      console.log('🔍 GuestForm: Iniciando operação...')
      console.log('🔍 GuestForm: mode =', mode)
      console.log('🔍 GuestForm: formData =', formData)
      
      // Dividir o nome completo em primeiro e último nome
      const nameParts = formData.name.trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Preparar dados para a API (remover máscaras)
      const guestData: CreateGuestRequest = {
        firstName: firstName,
        lastName: lastName,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''), // Remove tudo que não é número
        document: formData.document.replace(/\D/g, ''), // Remove tudo que não é número
        eventId: formData.eventId,
      }
      
      console.log('🔍 GuestForm: guestData =', guestData)
      
      if (mode === 'create') {
        const guestId = await GuestsService.createGuest(guestData)
        console.log('✅ GuestForm: Guest criado com ID:', guestId)
      } else if (mode === 'edit' && guestId) {
        await GuestsService.updateGuest(guestId, guestData)
        console.log('✅ GuestForm: Guest atualizado')
      }
      
      // Redirecionar usando a função auxiliar
      handleGoBack()
    } catch (err: any) {
      console.error('❌ GuestForm: Erro na operação:', err)
      setError(err.message || 'Erro ao salvar guest')
    } finally {
      setIsLoading(false)
    }
  }

  // Debug: mostrar estado atual do formData
  console.log('🔍 GuestForm: Render - formData atual:', formData)
  console.log('🔍 GuestForm: Render - mode:', mode, 'guestId:', guestId)

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
            {mode === 'create' ? 'Novo Convidado' : 'Editar Convidado'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Cadastre um novo convidado no sistema' 
              : 'Atualize as informações do convidado'
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
        <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Dados básicos do convidado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Maria Silva"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                    CPF *
                  </label>
                  <Input
                    id="document"
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
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
                      placeholder="maria@email.com"
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
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Event Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Evento
                </CardTitle>
                <CardDescription>
                  Selecione o evento para o qual o convidado está sendo cadastrado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
                    Evento *
                  </label>
                  <select
                    id="eventId"
                    name="eventId"
                    value={formData.eventId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={isLoadingEvents}
                  >
                    <option value="">Selecione um evento</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name} - {new Date(event.startDate).toLocaleDateString('pt-BR')}
                      </option>
                    ))}
                  </select>
                  {isLoadingEvents && (
                    <p className="text-sm text-gray-500 mt-1">Carregando eventos...</p>
                  )}
                </div>
              </CardContent>
            </Card>

        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={handleGoBack}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading 
              ? (mode === 'create' ? 'Criando...' : 'Salvando...') 
              : (mode === 'create' ? 'Criar Convidado' : 'Salvar Alterações')
            }
          </Button>
        </div>
      </form>
    </div>
  )
}



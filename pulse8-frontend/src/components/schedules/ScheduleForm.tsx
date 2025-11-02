'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  Calendar as CalendarIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventsService, EventDto } from '@/lib/api/events'
import { SchedulesService, ScheduleDto, CreateScheduleRequest, UpdateScheduleRequest } from '@/lib/api/schedules'

interface ScheduleFormProps {
  scheduleId?: string
  mode: 'create' | 'edit'
  eventId?: string
}

// Função para converter data da API para formato datetime-local
const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Função para converter data do formulário para ISO string
const formatDateForAPI = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toISOString()
}


export default function ScheduleForm({ scheduleId, mode, eventId }: ScheduleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [error, setError] = useState('')
  const [events, setEvents] = useState<EventDto[]>([])
  const [schedule, setSchedule] = useState<ScheduleDto | null>(null)
  
  const [formData, setFormData] = useState({
    eventId: eventId || '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  })

  // Função auxiliar para redirecionamento baseado no contexto
  const handleGoBack = () => {
    // Usar eventId da prop ou do schedule carregado
    const currentEventId = eventId || schedule?.eventId
    
    if (currentEventId) {
      router.push(`/events/${currentEventId}/edit?tab=schedule`)
    } else {
      router.push('/calendar/schedules')
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
        setError(err.message || 'Erro ao carregar eventos')
      } finally {
        setIsLoadingEvents(false)
      }
    }
    loadEvents()
  }, [])

  // Carregar dados do schedule para edição
  useEffect(() => {
    const loadSchedule = async () => {
      if (mode === 'edit' && scheduleId) {
        try {
          setIsLoading(true)
          setError('')
          
          const scheduleData = await SchedulesService.getScheduleById(scheduleId)
          console.log('🔍 ScheduleForm: Dados recebidos da API =', scheduleData)
          setSchedule(scheduleData)
          
          // Preencher formulário
          const formDataToSet = {
            eventId: scheduleData.eventId || '',
            title: scheduleData.title,
            description: scheduleData.description || '',
            startTime: formatDateForInput(scheduleData.startTime),
            endTime: formatDateForInput(scheduleData.endTime),
          }
          
          console.log('🔍 ScheduleForm: formDataToSet =', formDataToSet)
          
          setFormData(formDataToSet)
        } catch (err: any) {
          console.error('❌ Erro ao carregar schedule:', err)
          setError(err.message || 'Erro ao carregar dados do cronograma')
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    loadSchedule()
  }, [mode, scheduleId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      if (mode === 'create') {
        const scheduleData: CreateScheduleRequest = {
          eventId: formData.eventId,
          title: formData.title,
          description: formData.description,
          startTime: formatDateForAPI(formData.startTime),
          endTime: formatDateForAPI(formData.endTime),
        }
        
        console.log('🔍 CreateSchedule: Dados do cronograma =', scheduleData)
        const newScheduleId = await SchedulesService.createSchedule(scheduleData)
        console.log('✅ CreateSchedule: Cronograma criado com ID:', newScheduleId)
        
        // Redirecionar usando a função auxiliar
        handleGoBack()
      } else {
        const scheduleData: UpdateScheduleRequest = {
          id: scheduleId!,
          eventId: formData.eventId,
          title: formData.title,
          description: formData.description,
          startTime: formatDateForAPI(formData.startTime),
          endTime: formatDateForAPI(formData.endTime),
        }
        
        console.log('🔍 UpdateSchedule: Dados do cronograma =', scheduleData)
        await SchedulesService.updateSchedule(scheduleId!, scheduleData)
        console.log('✅ UpdateSchedule: Cronograma atualizado')
        
        // Redirecionar usando a função auxiliar (verifica eventId)
        handleGoBack()
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar cronograma:', error)
      // Capturar mensagem de erro detalhada do backend
      const errorMessage = error?.message || error?.response?.data?.message || 'Erro ao salvar cronograma. Tente novamente.'
      setError(errorMessage)
      
      // Log detalhado para debug
      if (error?.response?.data) {
        console.error('❌ Detalhes do erro:', error.response.data)
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error && mode === 'edit') {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    )
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
            {mode === 'create' ? 'Novo Cronograma' : 'Editar Cronograma'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' ? 'Crie um novo item no cronograma' : 'Atualize as informações do cronograma'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Informações do Cronograma
              </CardTitle>
              <CardDescription>
                Dados principais do cronograma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  disabled={isLoadingEvents}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {isLoadingEvents ? 'Carregando eventos...' : 'Selecione um evento'}
                  </option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Setup do Palco Principal"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva o que será feito neste cronograma..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Data/Hora de Início *
                  </label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Data/Hora de Fim *
                  </label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={handleGoBack}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : (mode === 'create' ? 'Criar Cronograma' : 'Salvar Alterações')}
          </Button>
        </div>
      </form>
    </div>
  )
}
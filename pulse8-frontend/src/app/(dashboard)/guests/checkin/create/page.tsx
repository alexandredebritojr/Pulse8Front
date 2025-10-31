'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Users,
  QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GuestsService, GuestDto, CheckInService, CheckInRequest } from '@/lib/api/guests'
import { EventsService, EventDto } from '@/lib/api/events'

export default function CreateCheckInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [guests, setGuests] = useState<GuestDto[]>([])
  const [events, setEvents] = useState<EventDto[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    guestId: '',
    eventId: '',
    checkInTime: '',
    notes: ''
  })

  // Carregar dados reais da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        const [guestsData, eventsData] = await Promise.all([
          GuestsService.getGuests(),
          EventsService.getEvents()
        ])
        setGuests(guestsData?.guests || [])
        setEvents(eventsData?.events || [])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('🔍 CreateCheckInPage: Iniciando check-in...')
      console.log('🔍 CreateCheckInPage: formData =', formData)
      
      const checkInData: CheckInRequest = {
        guestId: formData.guestId,
        eventId: formData.eventId,
        checkInTime: formData.checkInTime || new Date().toISOString(),
        notes: formData.notes
      }
      
      const result = await CheckInService.checkInGuest(checkInData)
      console.log('✅ Check-in realizado com sucesso:', result)
      
      router.push('/guests/checkin')
    } catch (error) {
      console.error('❌ Erro ao criar check-in:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getGuestName = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId)
    return guest ? guest.name : ''
  }

  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    return event ? event.name : ''
  }

  const getGuestType = (guestId: string) => {
    return 'Convidado' // Simplificado - todos são convidados
  }

  const getGuestTypeColor = (type: string) => {
    switch (type) {
      case 'VIP':
        return 'text-purple-600'
      case 'Regular':
        return 'text-blue-600'
      case 'Staff':
        return 'text-green-600'
      case 'Press':
        return 'text-orange-600'
      case 'Artist':
        return 'text-pink-600'
      case 'Promoter':
        return 'text-indigo-600'
      default:
        return 'text-gray-600'
    }
  }

  const getGuestTypeIcon = (type: string) => {
    switch (type) {
      case 'VIP':
        return '👑'
      case 'Regular':
        return '🎫'
      case 'Staff':
        return '👥'
      case 'Press':
        return '📰'
      case 'Artist':
        return '🎭'
      case 'Promoter':
        return '💼'
      default:
        return '👤'
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/guests/checkin">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Check-in</h1>
          <p className="text-gray-600">Registre o check-in de um convidado</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guest Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Seleção do Convidado
            </CardTitle>
            <CardDescription>
              Escolha o convidado que fará o check-in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="guestId" className="text-sm font-medium leading-none">
                Convidado *
              </label>
              <select
                id="guestId"
                name="guestId"
                value={formData.guestId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Selecione um convidado</option>
                {guests?.map(guest => (
                  <option key={guest.id} value={guest.id}>
                    {guest.name} - {guest.email}
                  </option>
                )) || []}
              </select>
            </div>

            {formData.guestId && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {getGuestName(formData.guestId).charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{getGuestName(formData.guestId)}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {guests.find(g => g.id === formData.guestId)?.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {guests.find(g => g.id === formData.guestId)?.phone}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center gap-1 text-sm ${getGuestTypeColor(getGuestType(formData.guestId))}`}>
                        <span>{getGuestTypeIcon(getGuestType(formData.guestId))}</span>
                        {getGuestType(formData.guestId)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seleção do Evento
            </CardTitle>
            <CardDescription>
              Escolha o evento para o check-in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="eventId" className="text-sm font-medium leading-none">
                Evento *
              </label>
              <select
                id="eventId"
                name="eventId"
                value={formData.eventId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Selecione um evento</option>
                {events?.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} - {new Date(event.startDate).toLocaleDateString('pt-BR')}
                  </option>
                )) || []}
              </select>
            </div>

            {formData.eventId && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{getEventName(formData.eventId)}</h3>
                    <p className="text-sm text-gray-600">
                      Data: {new Date(events.find(e => e.id === formData.eventId)?.startDate || '').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-in Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Detalhes do Check-in
            </CardTitle>
            <CardDescription>
              Configure os detalhes do check-in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="checkInTime" className="text-sm font-medium leading-none">
                Data e Hora do Check-in
              </label>
              <Input
                id="checkInTime"
                name="checkInTime"
                type="datetime-local"
                value={formData.checkInTime}
                onChange={handleChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Deixe em branco para usar a data e hora atual
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium leading-none">
                Observações
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Observações sobre o check-in..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/guests/checkin">
            <Button variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Check-in'}
          </Button>
        </div>
      </form>
    </div>
  )
}





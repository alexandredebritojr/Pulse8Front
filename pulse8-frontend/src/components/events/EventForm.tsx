'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Plus, 
  Trash2, 
  Edit,
  Clock,
  Megaphone,
  UserCheck,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { EventsService, EventDto, CreateEventRequest, UpdateEventRequest } from '@/lib/api/events'
import { ExpensesService, ExpenseDto, GetExpensesQuery } from '@/lib/api/expenses'
import { RevenueService, RevenueDto, GetRevenueQuery } from '@/lib/api/revenue'
import { GuestsService, GuestDto, GetGuestsQuery } from '@/lib/api/guests'
import { SchedulesService, ScheduleDto, GetSchedulesQuery } from '@/lib/api/schedules'
import { MarketingService, MarketingDto, GetMarketingQuery } from '@/lib/api/marketing'
import { TeamService, PersonDto, GetPeopleQuery } from '@/lib/api/team'
import { PromotersService, PromoterDto, GetPromotersQuery } from '@/lib/api/promoters'
import { formatDateOnly } from '@/lib/utils'
import ConfirmationModal from '@/components/ui/confirmation-modal'

interface EventFormProps {
  eventId?: string
  mode: 'create' | 'edit'
  initialTab?: string
}

// Função para converter data da API para formato datetime-local sem alterar o horário
const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString)
  // Usar métodos locais para evitar conversão de fuso horário
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Função para converter data do formulário para ISO string preservando horário local
const formatDateForAPI = (dateString: string): string => {
  // Criar data local sem conversão de fuso horário
  const date = new Date(dateString)
  return date.toISOString()
}

// Função para normalizar e obter o texto do status
const getStatusText = (status: string | number | null | undefined): string => {
  if (status === null || status === undefined) return 'Inativo'
  
  const statusStr = String(status).toLowerCase()
  
  // Verificar valores numéricos (enum)
  if (statusStr === '0') return 'Ativo'
  if (statusStr === '1') return 'Inativo'
  if (statusStr === '2') return 'Suspenso'
  
  // Verificar strings (do backend que retorna "Active", "Inactive", "Suspended")
  if (statusStr === 'active') return 'Ativo'
  if (statusStr === 'inactive') return 'Inativo'
  if (statusStr === 'suspended') return 'Suspenso'
  
  return 'Inativo' // Default
}

// Função para obter a cor do status
const getStatusColor = (status: string | number | null | undefined): string => {
  if (status === null || status === undefined) return 'bg-gray-100 text-gray-800'
  
  const statusStr = String(status).toLowerCase()
  
  // Verificar valores numéricos (enum)
  if (statusStr === '0') return 'bg-green-100 text-green-800'
  if (statusStr === '1') return 'bg-yellow-100 text-yellow-800'
  if (statusStr === '2') return 'bg-red-100 text-red-800'
  
  // Verificar strings (do backend que retorna "Active", "Inactive", "Suspended")
  if (statusStr === 'active') return 'bg-green-100 text-green-800'
  if (statusStr === 'inactive') return 'bg-yellow-100 text-yellow-800'
  if (statusStr === 'suspended') return 'bg-red-100 text-red-800'
  
  return 'bg-gray-100 text-gray-800' // Default
}

export default function EventForm({ eventId, mode, initialTab }: EventFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(initialTab || 'basic')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    address: '',
    city: '',
    state: '',
    capacity: '',
    totalBudget: '',
    ticketPrice: '',
    imageUrl: '',
    bannerUrl: '',
    website: '',
    socialMedia: '',
    status: 'draft', // Status padrão
  })

  // Dados para os grids das abas de gerenciamento
  const [budgetItems, setBudgetItems] = useState([
    { id: '1', category: 'Equipamentos', amount: 5000, description: 'Som e iluminação' },
    { id: '2', category: 'Local', amount: 3000, description: 'Aluguel do espaço' }
  ])

  const [expenseItems, setExpenseItems] = useState<ExpenseDto[]>([])
  const [expensesLoading, setExpensesLoading] = useState(false)
  const [expensesError, setExpensesError] = useState('')

  const [revenueItems, setRevenueItems] = useState<RevenueDto[]>([])
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [revenueError, setRevenueError] = useState('')

  const [guestItems, setGuestItems] = useState<GuestDto[]>([])
  const [guestsLoading, setGuestsLoading] = useState(false)
  const [guestsError, setGuestsError] = useState('')

  const [scheduleItems, setScheduleItems] = useState<ScheduleDto[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState('')

  const [marketingItems, setMarketingItems] = useState<MarketingDto[]>([])
  const [marketingLoading, setMarketingLoading] = useState(false)
  const [marketingError, setMarketingError] = useState('')

  const [teamItems, setTeamItems] = useState<PersonDto[]>([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamError, setTeamError] = useState('')

  const [promoterItems, setPromoterItems] = useState<PromoterDto[]>([])
  const [promotersLoading, setPromotersLoading] = useState(false)
  const [promotersError, setPromotersError] = useState('')
  
  // Estados para modais de confirmação
  const [showDeleteExpenseModal, setShowDeleteExpenseModal] = useState(false)
  const [showDeleteRevenueModal, setShowDeleteRevenueModal] = useState(false)
  const [showDeleteGuestModal, setShowDeleteGuestModal] = useState(false)
  const [showDeleteScheduleModal, setShowDeleteScheduleModal] = useState(false)
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false)
  const [showDeletePromoterModal, setShowDeletePromoterModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name?: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Função para carregar despesas do evento
  const loadExpenses = async (eventId: string) => {
    setExpensesLoading(true)
    setExpensesError('')
    
    try {
      console.log('🔍 Carregando despesas para o evento:', eventId)
      const query: GetExpensesQuery = {
        eventId: eventId,
        pageNumber: 1,
        pageSize: 100 // Carregar todas as despesas do evento
      }
      
      const response = await ExpensesService.getExpenses(query)
      console.log('✅ Despesas carregadas:', response)
      
      // Garantir que response.expenses existe e é um array
      const expensesData = response?.expenses || []
      setExpenseItems(expensesData)
    } catch (err: any) {
      console.error('❌ Erro ao carregar despesas:', err)
      setExpensesError(err.message || 'Erro ao carregar despesas')
      setExpenseItems([]) // Garantir que sempre temos um array
    } finally {
      setExpensesLoading(false)
    }
  }

  // Função para carregar receitas do evento
  const loadRevenue = async (eventId: string) => {
    setRevenueLoading(true)
    setRevenueError('')
    
    try {
      console.log('🔍 Carregando receitas para o evento:', eventId)
      const query: GetRevenueQuery = {
        eventId: eventId,
        pageNumber: 1,
        pageSize: 100
      }
      
      const response = await RevenueService.getRevenue(query)
      console.log('✅ Receitas carregadas:', response)
      
      // Garantir que response.revenues existe e é um array
      const revenueData = response?.revenues || []
      setRevenueItems(revenueData)
    } catch (err: any) {
      console.error('❌ Erro ao carregar receitas:', err)
      setRevenueError(err.message || 'Erro ao carregar receitas')
      setRevenueItems([]) // Garantir que sempre temos um array
    } finally {
      setRevenueLoading(false)
    }
  }

  // Função para carregar convidados do evento
  const loadGuests = async (eventId: string) => {
    setGuestsLoading(true)
    setGuestsError('')
    
    try {
      console.log('🔍 Carregando convidados para o evento:', eventId)
      const query: GetGuestsQuery = {
        eventId: eventId,
        pageNumber: 1,
        pageSize: 100
      }
      
      const response = await GuestsService.getGuests(query)
      console.log('✅ Convidados carregados:', response)
      
      // Garantir que response.guests existe e é um array, e filtrar apenas pelo eventId
      const allGuestsData = response?.guests || []
      // Filtrar no frontend também para garantir que apenas dados do evento sejam exibidos
      const guestsData = allGuestsData.filter(guest => guest.eventId === eventId)
      console.log('🔍 Convidados filtrados para o evento:', guestsData.length)
      setGuestItems(guestsData)
    } catch (err: any) {
      console.error('❌ Erro ao carregar convidados:', err)
      setGuestsError(err.message || 'Erro ao carregar convidados')
      setGuestItems([]) // Garantir que sempre temos um array
    } finally {
      setGuestsLoading(false)
    }
  }

  // Função para carregar cronograma do evento
  const loadSchedule = async (eventId: string) => {
    setScheduleLoading(true)
    setScheduleError('')
    
    try {
      console.log('🔍 Carregando cronograma para o evento:', eventId)
      const query: GetSchedulesQuery = {
        pageNumber: 1,
        pageSize: 100
      }
      
      const response = await SchedulesService.getSchedules(query)
      console.log('✅ Cronograma carregado:', response)
      
      // Garantir que response.schedules existe e é um array, depois filtrar
      const schedulesData = response?.schedules || []
      const eventSchedules = schedulesData.filter(schedule => schedule.eventId === eventId)
      setScheduleItems(eventSchedules)
    } catch (err: any) {
      console.error('❌ Erro ao carregar cronograma:', err)
      setScheduleError(err.message || 'Erro ao carregar cronograma')
      setScheduleItems([]) // Garantir que sempre temos um array
    } finally {
      setScheduleLoading(false)
    }
  }

  // Função para carregar marketing do evento
  const loadMarketing = async (eventId: string) => {
    setMarketingLoading(true)
    setMarketingError('')
    
    try {
      console.log('🔍 Carregando marketing para o evento:', eventId)
      
      // Buscar apenas campanhas do evento específico
      const query: GetMarketingQuery = {
        pageNumber: 1,
        pageSize: 100,
        eventId: eventId
      }
      
      const response = await MarketingService.getMarketingCampaigns(query)
      console.log('✅ Marketing carregado (com eventId):', response)
      console.log('🔍 Total de campanhas recebidas:', response?.campaigns?.length || 0)
      
      // Garantir que response.campaigns existe e é um array
      // O backend já filtra pelo eventId passado na query, então confiamos nele
      const marketingData = response?.campaigns || []
      console.log('🔍 Campanhas recebidas para o evento:', marketingData.length)
      setMarketingItems(marketingData)
    } catch (err: any) {
      console.error('❌ Erro ao carregar marketing:', err)
      setMarketingError(err.message || 'Erro ao carregar marketing')
      setMarketingItems([]) // Garantir que sempre temos um array
    } finally {
      setMarketingLoading(false)
    }
  }

  // Função para carregar equipe do evento
  const loadTeam = async (eventId: string) => {
    setTeamLoading(true)
    setTeamError('')
    
    try {
      console.log('🔍 Carregando equipe para o evento:', eventId)
      const query: GetPeopleQuery = {
        pageNumber: 1,
        pageSize: 100
      }
      
      const response = await TeamService.getPeople(query)
      console.log('✅ Equipe carregada:', response)
      
      // Garantir que response.people existe e é um array, depois filtrar
      const peopleData = response?.people || []
      const eventTeam = peopleData.filter(person => person.eventId === eventId)
      setTeamItems(eventTeam)
    } catch (err: any) {
      console.error('❌ Erro ao carregar equipe:', err)
      setTeamError(err.message || 'Erro ao carregar equipe')
      setTeamItems([]) // Garantir que sempre temos um array
    } finally {
      setTeamLoading(false)
    }
  }

  // Função para carregar promoters do evento
  const loadPromoters = async (eventId: string) => {
    setPromotersLoading(true)
    setPromotersError('')
    
    try {
      console.log('🔍 Carregando promoters para o evento:', eventId)
      const query: GetPromotersQuery = {
        pageNumber: 1,
        pageSize: 100
      }
      
      const response = await PromotersService.getPromoters(query)
      console.log('✅ Promoters carregados:', response)
      
      // Garantir que response.promoters existe e é um array, depois filtrar
      const promotersData = response?.promoters || []
      const eventPromoters = promotersData.filter(promoter => promoter.eventId === eventId)
      setPromoterItems(eventPromoters)
    } catch (err: any) {
      console.error('❌ Erro ao carregar promoters:', err)
      setPromotersError(err.message || 'Erro ao carregar promoters')
      setPromoterItems([]) // Garantir que sempre temos um array
    } finally {
      setPromotersLoading(false)
    }
  }

  // Função para formatar valor decimal (moeda brasileira) - precisa estar antes do useEffect
  const formatDecimalValue = (value: string): string => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    if (numbers === '') return ''
    
    // Converte para número e divide por 100 para ter 2 casas decimais
    const number = parseFloat(numbers) / 100
    
    // Formata como moeda brasileira
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Função para formatar número decimal já existente (do backend) para formato brasileiro
  const formatNumberToBrazilian = (num: number | undefined): string => {
    if (!num) return ''
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Função para converter valor formatado de volta para número
  const parseDecimalValue = (value: string): string => {
    // Remove formatação e converte para número com ponto decimal
    const cleaned = value.replace(/\./g, '').replace(',', '.')
    if (cleaned === '' || cleaned === '.') return ''
    const number = parseFloat(cleaned)
    return isNaN(number) ? '' : number.toString()
  }

  // Carregar dados do evento se estiver editando
  useEffect(() => {
    if (mode === 'edit' && eventId) {
      const loadEvent = async () => {
        try {
          console.log('🔍 Carregando evento para edição:', eventId)
          const eventData = await EventsService.getEventById(eventId)
          console.log('✅ Evento carregado para edição:', eventData)
          
          setFormData({
            name: eventData.name,
            description: eventData.description,
            startDate: formatDateForInput(eventData.startDate),
            endDate: formatDateForInput(eventData.endDate),
            location: eventData.location,
            address: eventData.address || '',
            city: eventData.city || '',
            state: eventData.state || '',
            capacity: eventData.capacity ? eventData.capacity.toString() : '',
            totalBudget: formatNumberToBrazilian(eventData.totalBudget),
            ticketPrice: formatNumberToBrazilian(eventData.ticketPrice),
            imageUrl: eventData.imageUrl || '',
            bannerUrl: eventData.bannerUrl || '',
            website: eventData.website || '',
            socialMedia: eventData.socialMedia || '',
            status: eventData.status ? String(eventData.status).toLowerCase() : 'planning',
          })
          
          // Carregar todos os dados relacionados ao evento
          await Promise.all([
            loadExpenses(eventId),
            loadRevenue(eventId),
            loadGuests(eventId),
            loadSchedule(eventId),
            loadMarketing(eventId),
            loadTeam(eventId),
            loadPromoters(eventId)
          ])
          
          setError('')
        } catch (err: any) {
          console.error('❌ Erro ao carregar evento:', err)
          setError(err.message || 'Erro ao carregar evento')
        } finally {
          setIsLoading(false)
        }
      }

      loadEvent()
    } else {
      setIsLoading(false)
    }
  }, [mode, eventId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    // Aplicar máscara decimal para campos monetários
    if ((name === 'totalBudget' || name === 'ticketPrice') && type !== 'checkbox') {
      const formatted = formatDecimalValue(value)
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      // Validações no frontend
      if (!formData.name || formData.name.trim() === '') {
        toast.error('Nome do evento é obrigatório')
        setIsSaving(false)
        return
      }

      if (!formData.description || formData.description.trim() === '') {
        toast.error('Descrição do evento é obrigatória')
        setIsSaving(false)
        return
      }

      if (!formData.location || formData.location.trim() === '') {
        toast.error('Local do evento é obrigatório')
        setIsSaving(false)
        return
      }

      if (!formData.startDate) {
        toast.error('Data de início é obrigatória')
        setIsSaving(false)
        return
      }

      if (!formData.endDate) {
        toast.error('Data de fim é obrigatória')
        setIsSaving(false)
        return
      }

      // Validar que endDate é posterior a startDate
      const startDate = new Date(formatDateForAPI(formData.startDate))
      const endDate = new Date(formatDateForAPI(formData.endDate))
      
      if (endDate <= startDate) {
        toast.error('Data de fim deve ser posterior à data de início')
        setIsSaving(false)
        return
      }

      // Validar capacidade (apenas se preenchida)
      let capacity: number | undefined = undefined
      if (formData.capacity && formData.capacity.trim() !== '') {
        const parsedCapacity = parseInt(formData.capacity)
        if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
          toast.error('Capacidade deve ser um número maior que zero')
          setIsSaving(false)
          return
        }
        capacity = parsedCapacity
      }

      console.log('🔍 Salvando evento...', formData)
      
      if (mode === 'create') {
        const createData: CreateEventRequest = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          address: formData.address?.trim() || undefined,
          city: formData.city?.trim() || undefined,
          state: formData.state?.trim() || undefined,
          capacity: capacity,
          startDate: formatDateForAPI(formData.startDate),
          endDate: formatDateForAPI(formData.endDate),
          ticketPrice: formData.ticketPrice ? parseFloat(parseDecimalValue(formData.ticketPrice)) : undefined,
          imageUrl: formData.imageUrl?.trim() || undefined,
          bannerUrl: formData.bannerUrl?.trim() || undefined,
          website: formData.website?.trim() || undefined,
          socialMedia: formData.socialMedia?.trim() || undefined,
          totalBudget: formData.totalBudget ? parseFloat(parseDecimalValue(formData.totalBudget)) : undefined,
          status: formData.status.charAt(0).toUpperCase() + formData.status.slice(1),
        }

        const eventId = await EventsService.createEvent(createData)
        console.log('✅ Evento criado com sucesso:', eventId)
        toast.success('Evento criado com sucesso!')
        router.push('/events')
      } else {
        const updateData: UpdateEventRequest = {
          id: eventId!,
          name: formData.name.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          address: formData.address?.trim() || undefined,
          city: formData.city?.trim() || undefined,
          state: formData.state?.trim() || undefined,
          capacity: capacity,
          startDate: formatDateForAPI(formData.startDate),
          endDate: formatDateForAPI(formData.endDate),
          ticketPrice: formData.ticketPrice ? parseFloat(parseDecimalValue(formData.ticketPrice)) : undefined,
          imageUrl: formData.imageUrl?.trim() || undefined,
          bannerUrl: formData.bannerUrl?.trim() || undefined,
          website: formData.website?.trim() || undefined,
          socialMedia: formData.socialMedia?.trim() || undefined,
          totalBudget: formData.totalBudget ? parseFloat(parseDecimalValue(formData.totalBudget)) : undefined,
          status: formData.status.charAt(0).toUpperCase() + formData.status.slice(1),
        }

        await EventsService.updateEvent(eventId!, updateData)
        console.log('✅ Evento atualizado com sucesso')
        toast.success('Evento atualizado com sucesso!')
        router.push(`/events/${eventId}`)
      }
    } catch (err: any) {
      console.error('❌ Erro ao salvar evento:', err)
      
      // Melhorar mensagens de erro e exibir em toast
      let errorMessage = 'Erro ao salvar evento'
      if (err.message) {
        errorMessage = err.message
        
        // Extrair mensagens de validação do backend se disponíveis
        if (err.message.includes('Validation failed')) {
          const validationMatch = err.message.match(/--\s+(\w+):\s+(.+?)(?=\s+--|$)/g)
          if (validationMatch && validationMatch.length > 0) {
            const validationErrors = validationMatch.map(m => m.replace(/--\s+/, '').replace(/:\s+/, ': '))
            errorMessage = `Erros de validação: ${validationErrors.join(', ')}`
          }
        }
        
        // Se a mensagem já contém uma validação clara do backend, usar diretamente
        // Exemplos: "Data de fim deve ser posterior à data de início", etc.
        if (err.message.includes('deve ser') || 
            err.message.includes('obrigatório') || 
            err.message.includes('inválido') ||
            err.message.includes('posterior') ||
            err.message.includes('anterior')) {
          errorMessage = err.message
        }
      }
      
      // Exibir erro em toast e manter formulário visível
      toast.error(errorMessage, {
        duration: 6000,
        position: 'top-center',
        style: {
          background: '#fee2e2',
          color: '#991b1b',
          padding: '16px',
          borderRadius: '8px',
          maxWidth: '500px'
        }
      })
      setError('') // Limpar erro do estado para não esconder o formulário
    } finally {
      setIsSaving(false)
    }
  }

  const addItem = (type: string) => {
    const newId = Date.now().toString()
    
    switch (type) {
      case 'budget':
        const newBudgetItem = { id: newId, category: '', amount: 0, description: '' }
        setBudgetItems([...budgetItems, newBudgetItem])
        break
      case 'expense':
        // Redirecionar para a página de criação de despesas
        if (eventId) {
          router.push(`/finance/expenses/create?eventId=${eventId}`)
        } else if (mode === 'create') {
          const shouldProceed = window.confirm('O evento ainda não foi salvo. Deseja criar a despesa agora? Você poderá associá-la ao evento depois.')
          if (shouldProceed) {
            router.push('/finance/expenses/create')
          }
        }
        break
      case 'revenue':
        // Redirecionar para a página de criação de receitas
        if (eventId) {
          router.push(`/finance/revenue/create?eventId=${eventId}`)
        } else if (mode === 'create') {
          const shouldProceed = window.confirm('O evento ainda não foi salvo. Deseja criar a receita agora? Você poderá associá-la ao evento depois.')
          if (shouldProceed) {
            router.push('/finance/revenue/create')
          }
        }
        break
      case 'guest':
        // Redirecionar para a página de criação de convidados
        if (eventId) {
          router.push(`/guests/create?eventId=${eventId}`)
        } else if (mode === 'create') {
          const shouldProceed = window.confirm('O evento ainda não foi salvo. Deseja criar o convidado agora? Você poderá associá-lo ao evento depois.')
          if (shouldProceed) {
            router.push('/guests/create')
          }
        }
        break
      case 'schedule':
        // Redirecionar para a página de criação de cronograma
        if (eventId) {
          router.push(`/calendar/schedules/create?eventId=${eventId}`)
        } else if (mode === 'create') {
          const shouldProceed = window.confirm('O evento ainda não foi salvo. Deseja criar o cronograma agora? Você poderá associá-lo ao evento depois.')
          if (shouldProceed) {
            router.push('/calendar/schedules/create')
          }
        }
        break
      case 'marketing':
        // Redirecionar para a página de criação de marketing
        if (eventId) {
          router.push(`/marketing/create?eventId=${eventId}`)
        } else if (mode === 'create') {
          // Se estiver criando um novo evento, mostrar mensagem ou redirecionar para criar campanha
          // O eventId será associado depois que o evento for salvo
          const shouldProceed = window.confirm('O evento ainda não foi salvo. Deseja criar a campanha agora? Você poderá associá-la ao evento depois.')
          if (shouldProceed) {
            router.push('/marketing/create')
          }
        }
        break
      case 'team':
        // Redirecionar para a página de criação de membros da equipe
        if (eventId) {
          router.push(`/team/create?eventId=${eventId}`)
        } else if (mode === 'create') {
          const shouldProceed = window.confirm('O evento ainda não foi salvo. Deseja criar o membro da equipe agora? Você poderá associá-lo ao evento depois.')
          if (shouldProceed) {
            router.push('/team/create')
          }
        }
        break
      case 'promoter':
        // Redirecionar para a página de criação de promoters
        if (eventId) {
          router.push(`/promoters/create?eventId=${eventId}`)
        } else if (mode === 'create') {
          const shouldProceed = window.confirm('O evento ainda não foi salvo. Deseja criar o promoter agora? Você poderá associá-lo ao evento depois.')
          if (shouldProceed) {
            router.push('/promoters/create')
          }
        }
        break
    }
  }

  const handleDeleteClick = (type: string, id: string, name?: string) => {
    setItemToDelete({ type, id, name })
    if (type === 'expense') {
      setShowDeleteExpenseModal(true)
    } else if (type === 'revenue') {
      setShowDeleteRevenueModal(true)
    } else if (type === 'guest') {
      setShowDeleteGuestModal(true)
    } else if (type === 'schedule') {
      setShowDeleteScheduleModal(true)
    } else if (type === 'team') {
      setShowDeleteTeamModal(true)
    } else if (type === 'promoter') {
      setShowDeletePromoterModal(true)
    } else {
      // Para outros tipos, deletar diretamente sem modal
      removeItem(type, id)
    }
  }

  const handleConfirmDelete = async () => {
    console.log('🔍 EventForm.handleConfirmDelete: Iniciando exclusão')
    console.log('🔍 EventForm.handleConfirmDelete: itemToDelete =', itemToDelete)
    
    if (!itemToDelete) {
      console.warn('⚠️ EventForm.handleConfirmDelete: itemToDelete é null/undefined')
      return
    }
    
    setIsDeleting(true)
    try {
      console.log('🔍 EventForm.handleConfirmDelete: Chamando removeItem - type:', itemToDelete.type, 'id:', itemToDelete.id)
      await removeItem(itemToDelete.type, itemToDelete.id)
      console.log('✅ EventForm.handleConfirmDelete: removeItem executado com sucesso')
      
      // Só fecha os modais se não houve erro
      setShowDeleteExpenseModal(false)
      setShowDeleteRevenueModal(false)
      setShowDeleteGuestModal(false)
      setShowDeleteScheduleModal(false)
      setShowDeleteTeamModal(false)
      setShowDeletePromoterModal(false)
      setItemToDelete(null)
      console.log('✅ EventForm.handleConfirmDelete: Modais fechados')
    } catch (err) {
      // Erro já foi tratado no removeItem com toast
      // Mantém o modal aberto para o usuário ver o erro
      console.error('❌ EventForm.handleConfirmDelete: Erro ao confirmar exclusão:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteExpenseModal(false)
    setShowDeleteRevenueModal(false)
    setShowDeleteGuestModal(false)
    setShowDeleteScheduleModal(false)
    setShowDeleteTeamModal(false)
    setShowDeletePromoterModal(false)
    setItemToDelete(null)
  }

  const removeItem = async (type: string, id: string) => {
    switch (type) {
      case 'budget':
        setBudgetItems(budgetItems.filter(item => item.id !== id))
        break
      case 'expense':
        try {
          console.log('🔍 Removendo despesa:', id)
          await ExpensesService.deleteExpense(id)
          console.log('✅ Despesa removida com sucesso')
          // Recarregar a lista de despesas
          if (eventId) {
            await loadExpenses(eventId)
          }
        } catch (err: any) {
          console.error('❌ Erro ao remover despesa:', err)
          setExpensesError(err.message || 'Erro ao remover despesa')
        }
        break
      case 'revenue':
        try {
          console.log('🔍 Removendo receita:', id)
          await RevenueService.deleteRevenue(id)
          console.log('✅ Receita removida com sucesso')
          if (eventId) {
            await loadRevenue(eventId)
          }
        } catch (err: any) {
          console.error('❌ Erro ao remover receita:', err)
          setRevenueError(err.message || 'Erro ao remover receita')
        }
        break
      case 'guest':
        try {
          console.log('🔍 Removendo convidado:', id)
          await GuestsService.deleteGuest(id)
          console.log('✅ Convidado removido com sucesso')
          if (eventId) {
            await loadGuests(eventId)
          }
        } catch (err: any) {
          console.error('❌ Erro ao remover convidado:', err)
          setGuestsError(err.message || 'Erro ao remover convidado')
        }
        break
      case 'schedule':
        try {
          console.log('🔍 Removendo atividade:', id)
          await SchedulesService.deleteSchedule(id)
          console.log('✅ Atividade removida com sucesso')
          if (eventId) {
            await loadSchedule(eventId)
          }
        } catch (err: any) {
          console.error('❌ Erro ao remover atividade:', err)
          setScheduleError(err.message || 'Erro ao remover atividade')
        }
        break
      case 'marketing':
        try {
          console.log('🔍 Removendo campanha:', id)
          await MarketingService.deleteMarketing(id)
          console.log('✅ Campanha removida com sucesso')
          if (eventId) {
            await loadMarketing(eventId)
          }
        } catch (err: any) {
          console.error('❌ Erro ao remover campanha:', err)
          setMarketingError(err.message || 'Erro ao remover campanha')
        }
        break
      case 'team':
        try {
          console.log('🔍 Removendo membro da equipe:', id)
          await TeamService.deleteTeamMember(id)
          console.log('✅ Membro removido com sucesso')
          if (eventId) {
            await loadTeam(eventId)
          }
        } catch (err: any) {
          console.error('❌ Erro ao remover membro:', err)
          setTeamError(err.message || 'Erro ao remover membro')
        }
        break
      case 'promoter':
        try {
          console.log('🔍 EventForm.removeItem: Removendo promoter - ID:', id)
          console.log('🔍 EventForm.removeItem: eventId:', eventId)
          
          await PromotersService.deletePromoter(id)
          
          console.log('✅ EventForm.removeItem: Promoter removido com sucesso')
          toast.success('Promoter excluído com sucesso')
          
          // Recarregar a lista de promoters após exclusão bem-sucedida
          if (eventId) {
            console.log('🔍 EventForm.removeItem: Recarregando lista de promoters para o evento:', eventId)
            await loadPromoters(eventId)
            console.log('✅ EventForm.removeItem: Lista de promoters recarregada')
          } else {
            console.warn('⚠️ EventForm.removeItem: eventId não encontrado, não será possível recarregar a lista')
          }
        } catch (err: any) {
          console.error('❌ EventForm.removeItem: Erro ao remover promoter:', err)
          console.error('❌ EventForm.removeItem: Detalhes do erro:', {
            message: err.message,
            response: err.response,
            status: err.response?.status,
            data: err.response?.data
          })
          const errorMessage = err.message || 'Erro ao remover promoter'
          setPromotersError(errorMessage)
          toast.error(errorMessage)
          throw err // Re-throw para que o modal possa tratar
        }
        break
    }
  }

  const getEmptyItem = (type: string) => {
    switch (type) {
      case 'budget':
        return { category: '', amount: 0, description: '' }
      case 'expense':
        return { description: '', amount: 0, date: '', category: '' }
      case 'revenue':
        return { description: '', amount: 0, date: '', category: '' }
      case 'guest':
        return { name: '', email: '', phone: '', status: 'pending' }
      case 'schedule':
        return { time: '', activity: '', description: '', responsible: '' }
      case 'marketing':
        return { channel: '', budget: 0, reach: 0, description: '' }
      case 'team':
        return { name: '', role: '', email: '', phone: '' }
      case 'promoter':
        return { name: '', contact: '', phone: '', commission: '' }
      default:
        return {}
    }
  }

  const allTabs = [
    { id: 'basic', name: 'Informações Básicas', icon: Calendar },
    { id: 'budget', name: 'Orçamento', icon: DollarSign },
    { id: 'expense', name: 'Despesas', icon: DollarSign },
    { id: 'revenue', name: 'Receitas', icon: BarChart3 },
    { id: 'guest', name: 'Convidados', icon: Users },
    { id: 'schedule', name: 'Cronograma', icon: Clock },
    { id: 'marketing', name: 'Marketing', icon: Megaphone },
    { id: 'team', name: 'Equipe', icon: Users },
    { id: 'promoter', name: 'Promoters', icon: UserCheck }
  ]

  // Filtrar tabs: esconder "Orçamento" tanto no modo de criação quanto no de edição
  const tabs = allTabs.filter(tab => tab.id !== 'budget')

  // Aplicar initialTab quando disponível
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  // Se a tab ativa foi escondida (budget), mudar para basic
  useEffect(() => {
    if (activeTab === 'budget') {
      setActiveTab('basic')
    }
  }, [activeTab])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados principais do evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Evento *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Festival de Verão 2024"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva o evento..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim *
                    </label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status do Evento
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="planning">Planejamento</option>
                      <option value="active">Ativo</option>
                      <option value="completed">Finalizado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Local do Evento *
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ex: Parque Ibirapuera"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Rua, número, bairro"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Selecione o estado</option>
                      <option value="AC">Acre (AC)</option>
                      <option value="AL">Alagoas (AL)</option>
                      <option value="AP">Amapá (AP)</option>
                      <option value="AM">Amazonas (AM)</option>
                      <option value="BA">Bahia (BA)</option>
                      <option value="CE">Ceará (CE)</option>
                      <option value="DF">Distrito Federal (DF)</option>
                      <option value="ES">Espírito Santo (ES)</option>
                      <option value="GO">Goiás (GO)</option>
                      <option value="MA">Maranhão (MA)</option>
                      <option value="MT">Mato Grosso (MT)</option>
                      <option value="MS">Mato Grosso do Sul (MS)</option>
                      <option value="MG">Minas Gerais (MG)</option>
                      <option value="PA">Pará (PA)</option>
                      <option value="PB">Paraíba (PB)</option>
                      <option value="PR">Paraná (PR)</option>
                      <option value="PE">Pernambuco (PE)</option>
                      <option value="PI">Piauí (PI)</option>
                      <option value="RJ">Rio de Janeiro (RJ)</option>
                      <option value="RN">Rio Grande do Norte (RN)</option>
                      <option value="RS">Rio Grande do Sul (RS)</option>
                      <option value="RO">Rondônia (RO)</option>
                      <option value="RR">Roraima (RR)</option>
                      <option value="SC">Santa Catarina (SC)</option>
                      <option value="SP">São Paulo (SP)</option>
                      <option value="SE">Sergipe (SE)</option>
                      <option value="TO">Tocantins (TO)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget and Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Orçamento e Capacidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-700 mb-1">
                      Orçamento Total
                    </label>
                    <Input
                      id="totalBudget"
                      name="totalBudget"
                      type="text"
                      value={formData.totalBudget}
                      onChange={handleChange}
                      placeholder="0,00"
                      inputMode="decimal"
                    />
                  </div>
                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                      Capacidade Máxima
                    </label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Preço do Ingresso
                    </label>
                    <Input
                      id="ticketPrice"
                      name="ticketPrice"
                      type="text"
                      value={formData.ticketPrice}
                      onChange={handleChange}
                      placeholder="0,00"
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media and Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mídia e Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      URL da Imagem
                    </label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  <div>
                    <label htmlFor="bannerUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      URL do Banner
                    </label>
                    <Input
                      id="bannerUrl"
                      name="bannerUrl"
                      value={formData.bannerUrl}
                      onChange={handleChange}
                      placeholder="https://exemplo.com/banner.jpg"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://exemplo.com"
                  />
                </div>
                <div>
                  <label htmlFor="socialMedia" className="block text-sm font-medium text-gray-700 mb-1">
                    Redes Sociais
                  </label>
                  <Input
                    id="socialMedia"
                    name="socialMedia"
                    value={formData.socialMedia}
                    onChange={handleChange}
                    placeholder="@exemplo, #hashtag"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'budget':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Itens do Orçamento</h3>
              <Button type="button" onClick={() => addItem('budget')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {budgetItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <Input placeholder="Categoria" defaultValue={item.category} />
                    <Input placeholder="Valor" type="number" defaultValue={item.amount} />
                    <Input placeholder="Descrição" defaultValue={item.description} />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeItem('budget', item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'expense':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Despesas do Evento</h3>
              <Button type="button" onClick={() => addItem('expense')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Despesa
              </Button>
            </div>
            
            {expensesError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-600 text-sm">{expensesError}</div>
                  </div>
            )}
            
            {expensesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : !expenseItems || expenseItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma despesa cadastrada para este evento</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vencimento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fornecedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenseItems.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateOnly(expense.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            expense.status === 1 ? 'bg-green-100 text-green-800' :
                            expense.status === 2 ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {expense.status === 1 ? 'Pago' :
                             expense.status === 2 ? 'Vencido' :
                             'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.supplierName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/finance/expenses/${expense.id}/edit?eventId=${eventId}&tab=expense`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick('expense', expense.id, expense.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                </div>
                        </td>
                      </tr>
              ))}
                  </tbody>
                </table>
            </div>
            )}
          </div>
        )

      case 'revenue':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Receitas do Evento</h3>
              <Button type="button" onClick={() => addItem('revenue')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Receita
              </Button>
            </div>
            
            {revenueError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-600 text-sm">{revenueError}</div>
                  </div>
            )}
            
            {revenueLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : !revenueItems || revenueItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma receita cadastrada para este evento</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fonte
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referência
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueItems.map((revenue) => (
                      <tr key={revenue.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {revenue.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {revenue.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(revenue.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {revenue.reference || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/finance/revenue/${revenue.id}/edit?eventId=${eventId}&tab=revenue`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick('revenue', revenue.id, revenue.source)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                </div>
                        </td>
                      </tr>
              ))}
                  </tbody>
                </table>
            </div>
            )}
          </div>
        )

      case 'guest':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Convidados do Evento</h3>
              <Button type="button" onClick={() => addItem('guest')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Convidado
              </Button>
            </div>
            
            {guestsError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-600 text-sm">{guestsError}</div>
                  </div>
            )}
            
            {guestsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : !guestItems || guestItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum convidado cadastrado para este evento</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guestItems.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {guest.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {guest.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {guest.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {guest.document}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {guest.checkInDate ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {new Date(guest.checkInDate).toLocaleDateString('pt-BR')}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/guests/${guest.id}/edit?eventId=${eventId}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick('guest', guest.id, guest.name)}
                            >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                        </td>
                      </tr>
              ))}
                  </tbody>
                </table>
            </div>
            )}
          </div>
        )

      case 'schedule':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Cronograma do Evento</h3>
              <Button type="button" onClick={() => addItem('schedule')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Atividade
              </Button>
            </div>
            
            {scheduleError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-600 text-sm">{scheduleError}</div>
                  </div>
            )}
            
            {scheduleLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : !scheduleItems || scheduleItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma atividade cadastrada para este evento</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Início
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fim
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduleItems.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {schedule.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(schedule.startTime).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(schedule.endTime).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                            schedule.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {schedule.status === 'completed' ? 'Concluído' :
                             schedule.status === 'in-progress' ? 'Em Andamento' :
                             'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/calendar/schedules/${schedule.id}/edit${eventId ? `?eventId=${eventId}` : ''}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick('schedule', schedule.id, schedule.title)}
                            >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                        </td>
                      </tr>
              ))}
                  </tbody>
                </table>
            </div>
            )}
          </div>
        )

      case 'marketing':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Marketing do Evento</h3>
              <Button type="button" onClick={() => addItem('marketing')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Campanha
              </Button>
            </div>
            
            {marketingError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-600 text-sm">{marketingError}</div>
                  </div>
            )}
            
            {marketingLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : !marketingItems || marketingItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma campanha de marketing cadastrada para este evento</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orçamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Canais
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {marketingItems.map((marketing) => (
                      <tr key={marketing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {marketing.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {marketing.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            marketing.status === 'active' ? 'bg-green-100 text-green-800' :
                            marketing.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {marketing.status === 'active' ? 'Ativo' :
                             marketing.status === 'completed' ? 'Concluído' :
                             'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marketing.budget ? `R$ ${marketing.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Array.isArray(marketing.channels) && marketing.channels.length > 0 
                            ? marketing.channels.join(', ') 
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {/* TODO: Implementar edição */}}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem('marketing', marketing.id)}
                            >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                        </td>
                      </tr>
              ))}
                  </tbody>
                </table>
            </div>
            )}
          </div>
        )

      case 'team':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Equipe do Evento</h3>
              <Button type="button" onClick={() => addItem('team')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </div>
            
            {teamError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-600 text-sm">{teamError}</div>
                  </div>
            )}
            
            {teamLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : !teamItems || teamItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum membro da equipe cadastrado para este evento</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Função
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamItems.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.role || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                            {getStatusText(member.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/team/${member.id}/edit${eventId ? `?eventId=${eventId}` : ''}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick('team', member.id, `${member.firstName} ${member.lastName}`)}
                            >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                        </td>
                      </tr>
              ))}
                  </tbody>
                </table>
            </div>
            )}
          </div>
        )

      case 'promoter':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Promoters do Evento</h3>
              <Button type="button" onClick={() => addItem('promoter')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Promoter
              </Button>
            </div>
            
            {promotersError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-600 text-sm">{promotersError}</div>
                  </div>
            )}
            
            {promotersLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : !promoterItems || promoterItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum promoter cadastrado para este evento</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taxa de Comissão
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendas Totais
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promoterItems.map((promoter) => (
                      <tr key={promoter.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {promoter.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {promoter.userEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {promoter.userPhone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {promoter.commissionRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {promoter.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promoter.status)}`}>
                            {getStatusText(promoter.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/promoters/${promoter.id}/edit${eventId ? `?eventId=${eventId}` : ''}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick('promoter', promoter.id, promoter.userName)}
                            >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                        </td>
                      </tr>
              ))}
                  </tbody>
                </table>
            </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Só mostrar tela de erro se for erro de carregamento (não de validação)
  // Erros de validação são mostrados via toast e o formulário permanece visível
  if (error && mode === 'edit' && !eventId) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Erro ao carregar evento</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/events" className="mt-4 inline-block">
          <Button>Voltar para Eventos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={mode === 'edit' ? `/events/${eventId}` : '/events'}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'edit' ? 'Editar Evento' : 'Criar Novo Evento'}
          </h1>
          <p className="text-gray-600">
            {mode === 'edit' ? 'Atualize as informações do evento' : 'Preencha as informações do seu evento'}
          </p>
        </div>
      </div>

      {/* Erros de carregamento são exibidos acima, erros de validação via toast */}
      {/* Não mostrar error aqui para não esconder o formulário */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Navigation */}
        <div 
          className="border-b border-gray-200 overflow-x-auto overflow-y-hidden scrollbar-hide"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            maxHeight: '50px',
            height: '50px'
          }}
        >
          <nav className="-mb-px flex space-x-8 min-w-max" style={{ height: '48px', alignItems: 'flex-end' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 h-full ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-shrink-0">{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>


        {/* Tab Content */}
        <Card>
          <CardContent className="p-6">
            {renderTabContent()}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href={mode === 'edit' ? `/events/${eventId}` : '/events'}>
            <Button variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : (mode === 'edit' ? 'Salvar Alterações' : 'Criar Evento')}
          </Button>
        </div>
      </form>

      {/* Modais de confirmação */}
      <ConfirmationModal
        isOpen={showDeleteExpenseModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Despesa"
        message={`Tem certeza que deseja excluir a despesa "${itemToDelete?.name || ''}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={showDeleteRevenueModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Receita"
        message={`Tem certeza que deseja excluir a receita "${itemToDelete?.name || ''}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={showDeleteGuestModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Convidado"
        message={`Tem certeza que deseja excluir o convidado "${itemToDelete?.name || ''}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={showDeleteScheduleModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Atividade"
        message={`Tem certeza que deseja excluir a atividade "${itemToDelete?.name || ''}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={showDeleteTeamModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Membro da Equipe"
        message={`Tem certeza que deseja excluir o membro da equipe "${itemToDelete?.name || ''}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={showDeletePromoterModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Promoter"
        message={`Tem certeza que deseja excluir o promoter "${itemToDelete?.name || ''}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}

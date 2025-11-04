// Dados mockados para teste de calendário
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  color?: string
  description?: string
  type?: 'schedule' | 'event'
  source?: 'schedules' | 'events'
  location?: string
}

// Função para calcular a próxima sexta-feira
function getNextFriday(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Domingo, 5 = Sexta
  let daysUntilFriday = (5 - dayOfWeek + 7) % 7
  // Se hoje for sexta-feira, usar a próxima (daqui a 7 dias)
  if (daysUntilFriday === 0) {
    daysUntilFriday = 7
  }
  const nextFriday = new Date(today)
  nextFriday.setDate(today.getDate() + daysUntilFriday)
  return nextFriday
}

// Função para gerar eventos mockados
export function getMockEvents(): CalendarEvent[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999)
  
  const nextFriday = getNextFriday()
  
  // Evento 1: Dura o dia inteiro de hoje e amanhã
  const event1Start = new Date(today)
  event1Start.setHours(0, 0, 0, 0)
  const event1End = new Date(tomorrow)
  event1End.setHours(23, 59, 59, 999)
  
  // Evento 2: Começa hoje às 14h e termina amanhã às 10h
  const event2Start = new Date(today)
  event2Start.setHours(14, 0, 0, 0)
  const event2End = new Date(tomorrow)
  event2End.setHours(10, 0, 0, 0)
  
  // Evento 3: Começa hoje às 12h e termina às 16h
  const event3Start = new Date(today)
  event3Start.setHours(12, 0, 0, 0)
  const event3End = new Date(today)
  event3End.setHours(16, 0, 0, 0)
  
  // Evento 4: Começa hoje às 13h e termina às 14h
  const event4Start = new Date(today)
  event4Start.setHours(13, 0, 0, 0)
  const event4End = new Date(today)
  event4End.setHours(14, 0, 0, 0)
  
  // Evento 5: Começa sexta-feira às 10h e termina às 20h
  const event5Start = new Date(nextFriday)
  event5Start.setHours(10, 0, 0, 0)
  const event5End = new Date(nextFriday)
  event5End.setHours(20, 0, 0, 0)
  
  return [
    {
      id: '1',
      title: 'Evento de Dia Inteiro (Hoje e Amanhã)',
      start: event1Start,
      end: event1End,
      allDay: false, // Será tratado como multi-dia
      color: '#4285f4',
      description: 'Este evento dura o dia inteiro de hoje e amanhã'
    },
    {
      id: '2',
      title: 'Evento Multi-Dia (14h Hoje - 10h Amanhã)',
      start: event2Start,
      end: event2End,
      allDay: false,
      color: '#34a853',
      description: 'Começa hoje às 14h e termina amanhã às 10h'
    },
    {
      id: '3',
      title: 'Reunião (12h - 16h)',
      start: event3Start,
      end: event3End,
      allDay: false,
      color: '#ea4335',
      description: 'Reunião de hoje das 12h às 16h'
    },
    {
      id: '4',
      title: 'Almoço de Trabalho (13h - 14h)',
      start: event4Start,
      end: event4End,
      allDay: false,
      color: '#9333ea',
      description: 'Almoço de trabalho hoje das 13h às 14h'
    },
    {
      id: '5',
      title: 'Evento Sexta-feira (10h - 20h)',
      start: event5Start,
      end: event5End,
      allDay: false,
      color: '#fbbc04',
      description: 'Evento na próxima sexta-feira das 10h às 20h'
    }
  ]
}


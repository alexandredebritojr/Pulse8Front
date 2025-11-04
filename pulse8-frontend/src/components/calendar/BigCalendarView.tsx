'use client'

import { Calendar, momentLocalizer, View, ToolbarProps } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { CalendarEvent } from '@/lib/mock-calendar-events'

const localizer = momentLocalizer(moment)

// Toolbar customizado vazio para remover controles nativos
const CustomToolbar = () => {
  return null
}

interface BigCalendarViewProps {
  events: CalendarEvent[]
  currentDate: Date
  view: View
  onNavigate: (date: Date) => void
  onView: (view: View) => void
}

export default function BigCalendarView({ 
  events, 
  currentDate, 
  view, 
  onNavigate, 
  onView 
}: BigCalendarViewProps) {
  // Formatar eventos, garantindo que eventos multi-dia sejam exibidos corretamente
  const formattedEvents = events.map(event => {
    let start = new Date(event.start)
    let end = new Date(event.end)
    
    // Verificar se é um evento multi-dia
    const isMultiDay = end.getTime() - start.getTime() > 24 * 60 * 60 * 1000 || 
                      start.toDateString() !== end.toDateString()
    
    // Na visualização diária, ajustar eventos multi-dia para mostrar apenas a parte do dia atual
    if (view === 'day' && isMultiDay) {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)
      
      // Se o evento começa antes do dia atual, ajustar para começar às 00:00
      if (start < dayStart) {
        start = new Date(dayStart)
      }
      
      // Se o evento termina depois do dia atual, ajustar para terminar às 23:59
      if (end > dayEnd) {
        end = new Date(dayEnd)
      }
    }
    
    return {
      id: event.id,
      title: event.title,
      start: start,
      end: end,
      allDay: false, // Forçar false para eventos aparecerem no corpo
      resource: {
        ...event,
        isMultiDay
      }
    }
  })

  return (
    <div style={{ height: 'calc(100vh - 200px)', padding: '16px' }}>
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        date={currentDate}
        view={view}
        onNavigate={onNavigate}
        onView={onView}
        defaultDate={new Date()}
        views={['month', 'week', 'day', 'agenda']}
        showMultiDayTimes={true}
        step={60}
        timeslots={1}
        min={new Date(1970, 0, 1, 0, 0, 0)}
        max={new Date(1970, 0, 1, 23, 59, 59)}
        scrollToTime={new Date(1970, 0, 1, 8, 0, 0)}
        components={{
          toolbar: CustomToolbar
        }}
        eventPropGetter={(event) => {
          const bgColor = event.resource?.color || '#4285f4'
          return {
            style: {
              backgroundColor: bgColor,
              borderColor: bgColor,
              color: '#fff',
              borderRadius: '4px',
              border: 'none',
              padding: '2px 5px'
            }
          }
        }}
        formats={{
          dayFormat: 'dddd, DD/MM',
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }) => {
            return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
          }
        }}
        messages={{
          next: 'Próximo',
          previous: 'Anterior',
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
          agenda: 'Agenda',
          date: 'Data',
          time: 'Hora',
          event: 'Evento'
        }}
      />
    </div>
  )
}


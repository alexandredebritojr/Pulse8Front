'use client'

import { useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { CalendarEvent } from '@/lib/mock-calendar-events'
import '@/styles/fullcalendar.css'

interface FullCalendarViewProps {
  events: CalendarEvent[]
  currentDate: Date
  view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
  onNavigate: (date: Date) => void
  onView: (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => void
}

export default function FullCalendarView({ 
  events, 
  currentDate, 
  view, 
  onNavigate, 
  onView 
}: FullCalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null)

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      calendarApi.gotoDate(currentDate)
      calendarApi.changeView(view)
    }
  }, [currentDate, view])

  const formattedEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
    allDay: event.allDay,
    backgroundColor: event.color || '#4285f4',
    borderColor: event.color || '#4285f4',
    extendedProps: event
  }))

  return (
    <div style={{ padding: '16px', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        events={formattedEvents}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
          prev: 'Anterior',
          next: 'Próximo'
        }}
        height="100%"
        contentHeight="auto"
        scrollTime="08:00:00"
        scrollTimeReset={false}
        datesSet={(arg) => {
          onNavigate(arg.start)
        }}
        viewDidMount={(arg) => {
          if (arg.view.type !== view) {
            onView(arg.view.type as 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay')
          }
        }}
        eventClick={(info) => {
          alert(`Evento: ${info.event.title}`)
        }}
        firstDay={0}
      />
    </div>
  )
}


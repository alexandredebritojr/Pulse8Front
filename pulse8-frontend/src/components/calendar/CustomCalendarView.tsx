'use client'

import { useMemo } from 'react'
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarEvent } from '@/lib/mock-calendar-events'

interface CustomCalendarViewProps {
  events: CalendarEvent[]
  currentDate: Date
  view: 'month' | 'week' | 'day'
  onNavigate: (date: Date) => void
  onView: (view: 'month' | 'week' | 'day') => void
}

export default function CustomCalendarView({ 
  events, 
  currentDate, 
  view, 
  onNavigate, 
  onView 
}: CustomCalendarViewProps) {
  const today = new Date()

  const monthDays = useMemo(() => {
    if (view !== 'month') return []
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = startOfWeek(addDays(monthEnd, 6), { weekStartsOn: 0 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate, view])

  const weekDays = useMemo(() => {
    if (view !== 'week') return []
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [currentDate, view])

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return eventStart <= date && eventEnd >= date
    })
  }

  const getEventsForDayTime = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      const dayStart = new Date(date)
      dayStart.setHours(hour, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(hour + 1, 0, 0, 0)
      return eventStart < dayEnd && eventEnd > dayStart
    })
  }

  if (view === 'day') {
    const dayEvents = getEventsForDate(currentDate)
    const hourHeight = 64

    return (
      <div className="h-full overflow-auto bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-2xl font-bold mb-4">
            {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
          <div className="relative">
            {hours.map(hour => {
              const hourEvents = getEventsForDayTime(currentDate, hour)
              return (
                <div key={hour} className="flex border-t border-gray-200" style={{ minHeight: `${hourHeight}px` }}>
                  <div className="w-20 text-right pr-4 pt-2 text-sm text-gray-500">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 relative">
                    {hourEvents.map(event => {
                      const eventStart = new Date(event.start)
                      const eventEnd = new Date(event.end)
                      const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes()
                      const endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes()
                      const top = ((startMinutes % 60) / 60) * hourHeight
                      const height = ((endMinutes - startMinutes) / 60) * hourHeight
                      
                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 rounded px-2 py-1 text-xs text-white"
                          style={{
                            top: `${top}px`,
                            height: `${Math.max(height, 24)}px`,
                            backgroundColor: event.color || '#4285f4'
                          }}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs opacity-90">
                            {format(eventStart, 'HH:mm')} - {format(eventEnd, 'HH:mm')}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (view === 'week') {
    return (
      <div className="h-full overflow-auto bg-white p-4">
        <div className="text-2xl font-bold mb-4">
          Semana de {format(weekDays[0], "d 'de' MMMM", { locale: ptBR })} - {format(weekDays[6], "d 'de' MMMM", { locale: ptBR })}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const dayEvents = getEventsForDate(day)
            const isDayToday = isSameDay(day, today)
            
            return (
              <div key={idx} className="border rounded-lg p-2">
                <div className={`text-center font-semibold mb-2 ${isDayToday ? 'text-blue-600' : ''}`}>
                  <div className="text-xs">{format(day, 'EEE', { locale: ptBR })}</div>
                  <div className="text-lg">{format(day, 'd')}</div>
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 5).map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded text-white"
                      style={{ backgroundColor: event.color || '#4285f4' }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 5 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 5} mais</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto bg-white p-4">
      <div className="text-2xl font-bold mb-4">
        {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-700 p-2">
            {day}
          </div>
        ))}
        {monthDays.map((day, idx) => {
          const dayEvents = getEventsForDate(day)
          const isDayToday = isSameDay(day, today)
          const isCurrentMonth = isSameMonth(day, currentDate)
          
          return (
            <div
              key={idx}
              className={`border rounded p-2 min-h-[100px] ${!isCurrentMonth ? 'bg-gray-50' : ''} ${isDayToday ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${isDayToday ? 'text-blue-600' : isCurrentMonth ? '' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded text-white truncate"
                    style={{ backgroundColor: event.color || '#4285f4' }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayEvents.length - 3}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


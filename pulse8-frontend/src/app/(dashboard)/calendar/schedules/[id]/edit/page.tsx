'use client'

import { useSearchParams } from 'next/navigation'
import ScheduleForm from '@/components/schedules/ScheduleForm'

interface EditSchedulePageProps {
  params: {
    id: string
  }
}

export default function EditSchedulePage({ params }: EditSchedulePageProps) {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || undefined

  return <ScheduleForm mode="edit" scheduleId={params.id} eventId={eventId} />
}

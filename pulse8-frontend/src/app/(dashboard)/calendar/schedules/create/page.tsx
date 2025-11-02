import ScheduleForm from '@/components/schedules/ScheduleForm'

interface CreateSchedulePageProps {
  searchParams: {
    eventId?: string
  }
}

export default function CreateSchedulePage({ searchParams }: CreateSchedulePageProps) {
  return <ScheduleForm mode="create" eventId={searchParams.eventId} />
}
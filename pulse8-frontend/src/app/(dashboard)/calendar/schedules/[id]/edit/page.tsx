import ScheduleForm from '@/components/schedules/ScheduleForm'

interface EditSchedulePageProps {
  params: {
    id: string
  }
}

export default function EditSchedulePage({ params }: EditSchedulePageProps) {
  return <ScheduleForm mode="edit" scheduleId={params.id} />
}

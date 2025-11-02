import EventForm from '@/components/events/EventForm'

interface EditEventPageProps {
  params: {
    id: string
  }
  searchParams: {
    tab?: string
  }
}

export default function EditEventPage({ params, searchParams }: EditEventPageProps) {
  return <EventForm mode="edit" eventId={params.id} initialTab={searchParams.tab} />
}
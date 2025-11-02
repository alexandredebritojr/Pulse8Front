import GuestForm from '@/components/guests/GuestForm'

interface CreateGuestPageProps {
  searchParams: {
    eventId?: string
  }
}

export default function CreateGuestPage({ searchParams }: CreateGuestPageProps) {
  return <GuestForm mode="create" eventId={searchParams.eventId} />
}
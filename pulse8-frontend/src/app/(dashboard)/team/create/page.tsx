'use client'

import { useSearchParams } from 'next/navigation'
import TeamForm from '@/components/team/TeamForm'

export default function CreateTeamMemberPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || undefined

  return <TeamForm mode="create" eventId={eventId} />
}
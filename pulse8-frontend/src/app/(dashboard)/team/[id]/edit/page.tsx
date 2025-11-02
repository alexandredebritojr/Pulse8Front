'use client'

import { useParams, useSearchParams } from 'next/navigation'
import TeamForm from '@/components/team/TeamForm'

export default function EditTeamMemberPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const teamMemberId = params.id as string
  const eventId = searchParams.get('eventId') || undefined

  return <TeamForm mode="edit" teamMemberId={teamMemberId} eventId={eventId} />
}
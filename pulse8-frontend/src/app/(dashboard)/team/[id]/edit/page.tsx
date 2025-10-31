'use client'

import { useParams } from 'next/navigation'
import TeamForm from '@/components/team/TeamForm'

export default function EditTeamMemberPage() {
  const params = useParams()
  const teamMemberId = params.id as string

  return <TeamForm mode="edit" teamMemberId={teamMemberId} />
}
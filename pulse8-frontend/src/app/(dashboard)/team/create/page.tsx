import TeamForm from '@/components/team/TeamForm'

interface CreateTeamMemberPageProps {
  searchParams: {
    eventId?: string
  }
}

export default function CreateTeamMemberPage({ searchParams }: CreateTeamMemberPageProps) {
  return <TeamForm mode="create" eventId={searchParams.eventId} />
}
import RoleForm from '@/components/team/RoleForm'

interface EditRolePageProps {
  params: {
    id: string
  }
}

export default function EditRolePage({ params }: EditRolePageProps) {
  return <RoleForm mode="edit" roleId={params.id} />
}
import { User } from '@/types/api'

export function normalizeUser(user: any): User {
  // Construir o nome do usuário: verificar se há name direto, senão concatenar FirstName e LastName
  let userName = 'Usuário'
  
  if (user.name) {
    userName = user.name
  } else if (user.Name) {
    userName = user.Name
  } else if (user.firstName || user.FirstName || user.lastName || user.LastName) {
    const firstName = (user.firstName || user.FirstName || '').trim()
    const lastName = (user.lastName || user.LastName || '').trim()
    userName = [firstName, lastName].filter(Boolean).join(' ') || 'Usuário'
  }
  
  return {
    id: user.id || user.Id || '',
    name: userName,
    email: user.email || user.Email || '',
    role: user.role || user.Role || 'user',
    status: user.status || user.Status || 'active',
    permissions: user.permissions || user.Permissions || [],
    avatar: user.avatar || user.Avatar || '',
    department: user.department || user.Department,
    position: user.position || user.Position,
    phone: user.phone || user.Phone,
    lastLogin: user.lastLogin || user.LastLogin,
    createdAt: user.createdAt || user.CreatedAt,
    organizationId: user.organizationId || user.OrganizationId,
    userOrganizationType: user.userOrganizationType ?? user.UserOrganizationType,
    userOrganizationTypeName: user.userOrganizationTypeName || user.UserOrganizationTypeName
  }
}

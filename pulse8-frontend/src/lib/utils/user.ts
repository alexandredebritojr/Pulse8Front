import { User } from '@/types/api'

export function normalizeUser(user: any): User {
  return {
    id: user.id || user.Id || '',
    name: user.name || 'Usuário',
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
    organizationId: user.organizationId || user.OrganizationId
  }
}

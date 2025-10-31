// Tipos base para a API
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Tipos para Eventos
export interface Event {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: EventStatus
  totalBudget: number
  organizationId: string
  createdAt: string
  updatedAt: string
}

export enum EventStatus {
  Planning = 'Planning',
  Active = 'Active',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

// Tipos para Organizações
export interface Organization {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Tipos para Usuários
export interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  permissions: string[]
  avatar: string
  department?: string
  position?: string
  phone?: string
  lastLogin?: string
  createdAt?: string
  organizationId?: string
}

export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Coordinator = 'coordinator',
  Operator = 'operator',
  Viewer = 'viewer'
}

// Tipos para Despesas
export interface EventExpense {
  id: string
  eventId: string
  description: string
  amount: number
  category: string
  status: ExpenseStatus
  supplierId?: string
  createdAt: string
  updatedAt: string
}

export enum ExpenseStatus {
  Pending = 0,
  Paid = 1,
  Overdue = 2,
  Cancelled = 3
}

export enum ExpenseCategory {
  Local = 'Local',
  Equipamentos = 'Equipamentos',
  Marketing = 'Marketing',
  Seguranca = 'Seguranca',
  Alimentacao = 'Alimentacao',
  Decoracao = 'Decoracao',
  Transporte = 'Transporte',
  Hospedagem = 'Hospedagem',
  Outros = 'Outros'
}

// Tipos para Pessoas
export interface Person {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  document: string
  organizationId: string
  status: PersonStatus
  createdAt: string
  updatedAt: string
}

export enum PersonStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended'
}

// Tipos para Cronogramas
export interface Schedule {
  id: string
  eventId: string
  title: string
  description: string
  startTime: string
  endTime: string
  type: ScheduleType
  status: ScheduleStatus
  createdAt: string
  updatedAt: string
}


// Tipos para Fornecedores
export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  organizationId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Tipos para Assets de Marketing
export interface MarketingAsset {
  id: string
  name: string
  description: string
  filePath: string
  originalName: string
  contentType: string
  fileSize: number
  type: AssetType
  organizationId: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export enum AssetType {
  Image = 'Image',
  Video = 'Video',
  Audio = 'Audio',
  Document = 'Document',
  PSD = 'PSD',
  AI = 'AI',
  Other = 'Other'
}

// Tipos para Convidados
export interface EventGuest {
  id: string
  eventId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  document: string
  type: GuestType
  status: GuestStatus
  qrCode?: string
  checkInTime?: string
  checkOutTime?: string
  createdAt: string
  updatedAt: string
}

export enum GuestType {
  Regular = 'Regular',
  VIP = 'VIP',
  Press = 'Press',
  Artist = 'Artist',
  Staff = 'Staff',
  Promoter = 'Promoter'
}

export enum GuestStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  CheckedIn = 'CheckedIn',
  CheckedOut = 'CheckedOut',
  NoShow = 'NoShow',
  Cancelled = 'Cancelled'
}

// Tipos para Promoters
export interface EventPromoter {
  id: string
  eventId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  commission: number
  status: PromoterStatus
  createdAt: string
  updatedAt: string
}

export enum PromoterStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended'
}

// Tipos para Cronograma de Postagens
export interface PostingSchedule {
  id: string
  eventId: string
  title: string
  content: string
  scheduledTime: string
  platform: string
  status: PostingStatus
  assetId?: string
  createdAt: string
  updatedAt: string
}

export enum PostingStatus {
  Draft = 'Draft',
  Scheduled = 'Scheduled',
  Published = 'Published',
  Failed = 'Failed'
}

// Tipos para Cronogramas
export enum ScheduleType {
  Setup = 'Setup',
  Soundcheck = 'Soundcheck',
  Event = 'Event',
  Teardown = 'Teardown',
  Meeting = 'Meeting',
  Other = 'Other',
  Task = 'Task'
}

export enum ScheduleStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}


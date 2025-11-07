export interface OrganizationData {
  name: string
  cnpj: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
}

export interface UserData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  document: string
  profilePicture?: string
}

export interface RegisterFormData {
  organization: OrganizationData
  user: UserData
  step: number
  acceptedTerms: boolean
}




/**
 * Valida CPF
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  
  if (cleaned.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleaned)) return false // Todos os dígitos iguais
  
  let sum = 0
  let remainder
  
  // Valida primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false
  
  // Valida segundo dígito
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false
  
  return true
}

/**
 * Valida CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')
  
  if (cleaned.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cleaned)) return false // Todos os dígitos iguais
  
  let length = cleaned.length - 2
  let numbers = cleaned.substring(0, length)
  const digits = cleaned.substring(length)
  let sum = 0
  let pos = length - 7
  
  // Valida primeiro dígito
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  
  // Valida segundo dígito
  length = length + 1
  numbers = cleaned.substring(0, length)
  sum = 0
  pos = length - 7
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}

/**
 * Valida força da senha
 */
export interface PasswordStrength {
  score: number // 0-5
  feedback: string[]
  isValid: boolean
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) {
    score++
  } else {
    feedback.push('Mínimo de 8 caracteres')
  }
  
  if (/[a-z]/.test(password)) {
    score++
  } else {
    feedback.push('Adicione letras minúsculas')
  }
  
  if (/[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Adicione letras maiúsculas')
  }
  
  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push('Adicione números')
  }
  
  if (/[^a-zA-Z\d]/.test(password)) {
    score++
  } else {
    feedback.push('Adicione caracteres especiais')
  }
  
  return {
    score,
    feedback: feedback.length > 0 ? feedback : ['Senha forte!'],
    isValid: score >= 4 && password.length >= 8
  }
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}




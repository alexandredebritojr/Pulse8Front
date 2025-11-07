/**
 * Formata CEP: 00000-000
 */
export function formatCEP(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 8)
  if (cleaned.length <= 5) {
    return cleaned
  }
  return cleaned.replace(/(\d{5})(\d+)/, '$1-$2')
}

/**
 * Remove formatação de CEP
 */
export function unformatCEP(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Formata telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 11)
  
  if (cleaned.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    if (cleaned.length <= 2) {
      return cleaned
    } else if (cleaned.length <= 6) {
      return cleaned.replace(/(\d{2})(\d+)/, '($1) $2')
    } else {
      return cleaned.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3')
    }
  } else {
    // Celular: (00) 00000-0000
    if (cleaned.length <= 2) {
      return cleaned
    } else if (cleaned.length <= 7) {
      return cleaned.replace(/(\d{2})(\d+)/, '($1) $2')
    } else {
      return cleaned.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3')
    }
  }
}

/**
 * Remove formatação de telefone
 */
export function unformatPhone(value: string): string {
  return value.replace(/\D/g, '')
}




import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Funções de formatação
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Funções para máscara de valor decimal (moeda)
export function formatCurrencyInput(value: string | number): string {
  if (!value) return ''
  
  // Se for número, converte para string formatada
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  
  // Remove tudo exceto números
  const numericValue = value.replace(/\D/g, '')
  
  if (!numericValue) return ''
  
  // Converte para número e divide por 100 para ter os centavos
  const numberValue = parseFloat(numericValue) / 100
  
  // Formata no padrão brasileiro
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function parseCurrencyInput(value: string): number {
  if (!value) return 0
  
  // Remove tudo exceto números
  const cleaned = value.replace(/\D/g, '')
  
  if (!cleaned) return 0
  
  // Converte para número e divide por 100 (já que o input armazena como centavos)
  const numberValue = parseFloat(cleaned) / 100
  
  return isNaN(numberValue) ? 0 : numberValue
}

// Função para formatar data preservando dia/mês/ano sem conversão de timezone
export function formatDateOnly(dateString: string): string {
  if (!dateString) return ''
  
  // Se a data está no formato ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)
  // Extrair apenas a parte da data (YYYY-MM-DD)
  const datePart = dateString.split('T')[0]
  const [year, month, day] = datePart.split('-')
  
  if (year && month && day) {
    return `${day}/${month}/${year}`
  }
  
  // Fallback para formatação normal
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  })
}
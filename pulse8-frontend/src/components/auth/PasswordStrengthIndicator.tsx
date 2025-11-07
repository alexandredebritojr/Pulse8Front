'use client'

import { validatePasswordStrength } from '@/lib/utils/validators'

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const strength = validatePasswordStrength(password)
  
  const getStrengthColor = () => {
    if (strength.score <= 2) return 'bg-red-500'
    if (strength.score === 3) return 'bg-yellow-500'
    if (strength.score === 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (strength.score <= 2) return 'Fraco'
    if (strength.score === 3) return 'Médio'
    if (strength.score === 4) return 'Bom'
    return 'Forte'
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${getStrengthColor().replace('bg-', 'text-')}`}>
          {getStrengthText()}
        </span>
      </div>
      {strength.feedback.length > 0 && (
        <ul className="mt-2 text-xs text-gray-600 space-y-1">
          {strength.feedback.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2">{strength.isValid ? '✓' : '•'}</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}




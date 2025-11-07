'use client'

import { User } from '@/types/api'
import { User as UserIcon, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  user: User
  onMenuClick?: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {/* Left side - Mobile menu button */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-gray-700 dark:text-gray-300"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Right side - User info and notifications */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications - Escondido */}
          {/* <Button variant="ghost" size="icon" className="relative text-gray-700 dark:text-gray-300">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button> */}

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-300">
                {user.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'Usuário'}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}


'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bot, Key, ExternalLink } from 'lucide-react'
import { UserMenu } from './user-menu'

interface AIFallbackProps {
  feature?: string
  className?: string
}

export function AIFallback({ feature = 'AI features', className = '' }: AIFallbackProps) {
  const { data: session } = useSession()

  return (
    <div className={`flex items-center gap-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg ${className}`}>
      <Bot className="h-5 w-5 text-amber-600" />
      <div className="flex-1">
        <p className="text-sm text-amber-800">
          <strong>AI features unavailable</strong> - Ollama not detected.
        </p>
        <p className="text-xs text-amber-700">
          {!session ? (
            <>Sign in to use your own AI API keys, or <a href="https://ollama.ai" target="_blank" className="underline">install Ollama</a></>
          ) : (
            <>Add your AI keys in settings, or <a href="https://ollama.ai" target="_blank" className="underline">install Ollama</a></>
          )}
        </p>
      </div>
      {!session && (
        <div className="shrink-0">
          <UserMenu />
        </div>
      )}
    </div>
  )
}
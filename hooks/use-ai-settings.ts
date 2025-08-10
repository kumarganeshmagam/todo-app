'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { aiManager } from '@/lib/ai'

export function useAISettings() {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.id) {
      // Load user AI settings and update the AI manager
      aiManager.loadUserSettings(session.user.id)
    } else {
      // Reset to Ollama for anonymous users
      aiManager.updateUserSettings({ preferredAI: 'ollama' })
    }
  }, [session?.user?.id])

  return {
    loadSettings: () => {
      if (session?.user?.id) {
        aiManager.loadUserSettings(session.user.id)
      }
    }
  }
}
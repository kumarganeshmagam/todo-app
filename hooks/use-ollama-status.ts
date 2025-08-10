'use client'

import { useState, useEffect } from 'react'
import { checkOllamaAvailability } from '@/lib/ai'

export function useOllamaStatus() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true)
      try {
        const available = await checkOllamaAvailability()
        setIsAvailable(available)
      } catch {
        setIsAvailable(false)
      } finally {
        setIsChecking(false)
      }
    }

    // Initial check with a small delay to allow UI to load
    setTimeout(checkStatus, 1000)
    
    // Check periodically (every 30 seconds)
    const interval = setInterval(checkStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return { isAvailable, isChecking }
}
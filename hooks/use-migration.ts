'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function useMigration() {
  const { data: session, status } = useSession()
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)

  useEffect(() => {
    // Only run once when user first logs in
    if (session?.user?.id && !hasInitialized && status === 'authenticated') {
      setHasInitialized(true)
      migrateUserData()
    }
  }, [session?.user?.id, hasInitialized, status])

  const migrateUserData = async () => {
    if (!session?.user?.id || isMigrating) return

    setIsMigrating(true)
    
    try {
      const keysToMigrate = ['tasks', 'notes', 'blogs']
      
      for (const key of keysToMigrate) {
        const localData = localStorage.getItem(key)
        if (localData) {
          try {
            const parsedData = JSON.parse(localData)
            if (parsedData && parsedData.length > 0) {
              const response = await fetch(`/api/user/${key}/migrate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: parsedData })
              })
              
              if (response.ok) {
                // Clear local storage after successful migration
                localStorage.removeItem(key)
                // Also clear any related UI state keys
                localStorage.removeItem(`selected-${key.slice(0, -1)}-id`)
              }
            }
          } catch (error) {
            console.error(`Failed to migrate ${key}:`, error)
          }
        }
      }
      
      // Clear any other related localStorage items
      localStorage.removeItem('notes-closed')
      localStorage.removeItem('notes-sidebar-open')
      localStorage.removeItem('blogs-sidebar-open')
      localStorage.removeItem('task-filter')
      
    } finally {
      setIsMigrating(false)
    }
  }

  return { isMigrating }
}
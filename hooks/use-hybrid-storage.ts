'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useLocalStorage } from './use-local-storage'

type StorageHook<T> = [T, (value: T | ((prev: T) => T)) => void, boolean]

// Hook that automatically switches between localStorage and database based on user auth
export function useHybridStorage<T>(key: string, defaultValue: T): StorageHook<T> {
  const { data: session } = useSession()
  const [localData, setLocalData] = useLocalStorage(key, defaultValue)
  const [dbData, setDbData] = useState<T>(defaultValue)
  const [isLoadingDb, setIsLoadingDb] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  // Load data from database when user is authenticated
  useEffect(() => {
    if (session?.user?.id && !hasLoadedOnce) {
      setIsLoadingDb(true)
      
      // Use localStorage data initially to prevent flickering, then load from DB
      const localStorageData = localStorage.getItem(key)
      if (localStorageData) {
        try {
          const parsedLocalData = JSON.parse(localStorageData)
          if (parsedLocalData && (Array.isArray(parsedLocalData) ? parsedLocalData.length > 0 : true)) {
            setDbData(parsedLocalData)
          }
        } catch {
          // Invalid localStorage data, ignore
        }
      }

      // Load from database
      fetch(`/api/user/${key}`)
        .then(res => res.ok ? res.json() : { data: defaultValue })
        .then(result => {
          setDbData(result.data || defaultValue)
          setIsLoadingDb(false)
          setHasLoadedOnce(true)
        })
        .catch(() => {
          setDbData(defaultValue)
          setIsLoadingDb(false)
          setHasLoadedOnce(true)
        })
    } else if (!session?.user?.id) {
      // Reset when user logs out
      setHasLoadedOnce(false)
      setIsLoadingDb(false)
    }
  }, [session?.user?.id, key, defaultValue, hasLoadedOnce])

  // Save to database when user is authenticated
  const saveToDb = async (data: T) => {
    if (session?.user?.id) {
      try {
        await fetch(`/api/user/${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data })
        })
      } catch (error) {
        console.error('Failed to save to database:', error)
      }
    }
  }

  // Unified setter function
  const setValue = (value: T | ((prev: T) => T)) => {
    if (session?.user?.id) {
      // User is authenticated - use database
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(dbData) : value
      setDbData(newValue)
      saveToDb(newValue)
    } else {
      // Anonymous user - use localStorage
      setLocalData(value)
    }
  }

  // Return appropriate data based on auth state
  if (session?.user?.id) {
    return [dbData, setValue, isLoadingDb]
  } else {
    return [localData, setValue, false]
  }
}

// Migration helper - when user signs up, migrate localStorage to database
export async function migrateLocalStorageToUser(userId: string) {
  const keysToMigrate = ['tasks', 'notes', 'blogs']
  const results: { [key: string]: boolean } = {}
  
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
          results[key] = response.ok
        }
      } catch (error) {
        console.error(`Failed to migrate ${key}:`, error)
        results[key] = false
      }
    }
  }
  
  // Only clear localStorage after successful migration
  Object.entries(results).forEach(([key, success]) => {
    if (success) {
      localStorage.removeItem(key)
    }
  })
  
  return results
}
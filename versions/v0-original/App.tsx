import React, { useEffect, useMemo, useRef, useState } from 'react'

type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

type Note = {
  id: string
  title: string
  contentHtml: string
  updatedAt: number
}

type Blog = {
  id: string
  title: string
  contentHtml: string
  updatedAt: number
}

type TaskFilter = 'all' | 'active' | 'completed'
type TabKey = 'tasks' | 'notes' | 'blogs'

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])

  return [value, setValue] as const
}

// Original component implementation...
export default function App() {
  const [tab, setTab] = useLocalStorage<TabKey>('active-tab', 'tasks')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">Focus</h1>
          <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1">
            <button className={`px-3 py-1.5 rounded-full text-sm transition-colors ${tab === 'tasks' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              Tasks
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm transition-colors ${tab === 'notes' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              Notes
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm transition-colors ${tab === 'blogs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              Blogs
            </button>
          </div>
        </div>
      </header>

      <main className={`mx-auto ${tab === 'notes' || tab === 'blogs' ? 'max-w-[1200px]' : 'max-w-[820px]'} px-4 py-8`}>
        <div className="text-center py-12">
          <p className="text-slate-500">Original Vite + React version</p>
        </div>
      </main>
    </div>
  )
}
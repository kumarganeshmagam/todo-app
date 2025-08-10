export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

export interface Note {
  id: string
  title: string
  contentHtml: string
  updatedAt: number
}

export interface Blog {
  id: string
  title: string
  contentHtml: string
  updatedAt: number
}

export type TaskFilter = 'all' | 'active' | 'completed'
export type TabKey = 'tasks' | 'notes' | 'blogs'
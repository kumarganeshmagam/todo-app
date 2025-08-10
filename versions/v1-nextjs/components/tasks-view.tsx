'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Todo, TaskFilter } from '@/types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, title: string) => void
}

function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempTitle, setTempTitle] = useState(todo.title)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onEdit(todo.id, tempTitle.trim())
      setIsEditing(false)
    }
    if (e.key === 'Escape') {
      setTempTitle(todo.title)
      setIsEditing(false)
    }
  }

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
          />

          {isEditing ? (
            <Input
              ref={inputRef}
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setIsEditing(false)
                setTempTitle(todo.title)
              }}
              className="flex-1"
            />
          ) : (
            <button
              onDoubleClick={() => setIsEditing(true)}
              onClick={() => onToggle(todo.id)}
              className={`text-left flex-1 ${
                todo.completed ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {todo.title}
            </button>
          )}

          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(todo.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TasksView() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('tasks', [])
  const [filter, setFilter] = useLocalStorage<TaskFilter>('task-filter', 'all')
  const [newTitle, setNewTitle] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  function addTodo() {
    const value = newTitle.trim()
    if (!value) return
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: value,
      completed: false,
      createdAt: Date.now(),
    }
    setTodos((t) => [todo, ...t])
    setNewTitle('')
  }

  function toggleTodo(id: string) {
    setTodos((list) => list.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  function deleteTodo(id: string) {
    setTodos((list) => list.filter((t) => t.id !== id))
  }

  function editTodo(id: string, title: string) {
    if (!title.trim()) return
    setTodos((list) => list.map((t) => (t.id === id ? { ...t, title } : t)))
  }

  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((t) => !t.completed)
      case 'completed':
        return todos.filter((t) => t.completed)
      default:
        return todos
    }
  }, [todos, filter])

  const activeTodos = todos.filter((t) => !t.completed).length

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Input
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addTodo()
              }}
              placeholder="Add a new task..."
              className="flex-1"
            />
            <Button onClick={addTodo} className="sm:w-auto w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as TaskFilter)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="text-sm text-muted-foreground">
              {activeTodos} active task{activeTodos !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Plus, X } from 'lucide-react'
import { useHybridStorage } from '@/hooks/use-hybrid-storage'
import { Todo, TaskFilter } from '@/types'
import SpeechToTask from '@/components/speech-to-task'
import AIToolbar from '@/components/ai-toolbar'

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
    <Card className="group hover:shadow-md transition-all duration-200 border-slate-200/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onToggle(todo.id)}
            className={`w-5 h-5 rounded-full border-2 p-0 transition-all ${
              todo.completed
                ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            {todo.completed && <Check className="w-3 h-3" />}
          </Button>

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
              className="flex-1 border-0 bg-transparent text-base focus-visible:ring-1"
            />
          ) : (
            <button
              onDoubleClick={() => setIsEditing(true)}
              className={`text-left flex-1 text-base transition-all ${
                todo.completed 
                  ? 'line-through text-muted-foreground' 
                  : 'text-foreground hover:text-muted-foreground'
              }`}
            >
              {todo.title}
            </button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(todo.id)}
            className="opacity-0 group-hover:opacity-100 w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TasksView() {
  const [todos, setTodos, isLoadingTodos] = useHybridStorage<Todo[]>('tasks', [])
  const [filter, setFilter] = useHybridStorage<TaskFilter>('task-filter', 'all')
  const [newTitle, setNewTitle] = useState('')
  const [selectedTasksText, setSelectedTasksText] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const tasksContainerRef = useRef<HTMLDivElement | null>(null)

  // Update selected text when user selects text in task list
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && tasksContainerRef.current) {
        const selectedText = selection.toString().trim()
        if (selectedText && tasksContainerRef.current.contains(selection.anchorNode)) {
          setSelectedTasksText(selectedText)
        } else {
          setSelectedTasksText('')
        }
      }
    }

    document.addEventListener('selectionchange', handleSelection)
    return () => document.removeEventListener('selectionchange', handleSelection)
  }, [])

  function addTodo(title?: string) {
    const value = (title || newTitle).trim()
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

  function addMultipleTodos(tasks: string[]) {
    const newTodos = tasks
      .filter(task => task.trim())
      .map(task => ({
        id: crypto.randomUUID(),
        title: task.trim(),
        completed: false,
        createdAt: Date.now(),
      }))
    
    if (newTodos.length > 0) {
      setTodos((t) => [...newTodos, ...t])
    }
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
    <div className="space-y-6">
      {/* Modern Add Task Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-slate-50">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Input
                ref={inputRef}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTodo()
                }}
                placeholder="What needs to be done?"
                className="flex-1 text-lg border-0 bg-transparent placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
              />
              <Button
                onClick={() => addTodo()}
                disabled={!newTitle.trim()}
                size="lg"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </Button>
              <SpeechToTask 
                onTaskCreated={addTodo}
                className="ml-2"
              />
            </div>

            {/* Modern Filter Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex bg-slate-100/70 rounded-xl p-1 backdrop-blur">
                {[
                  { id: 'all', label: 'All', count: todos.length },
                  { id: 'active', label: 'Active', count: activeTodos },
                  { id: 'completed', label: 'Completed', count: todos.length - activeTodos }
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={filter === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(tab.id as TaskFilter)}
                    className={`rounded-lg transition-all ${
                      filter === tab.id
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-white/50'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-200">
                        {tab.count}
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              {todos.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {activeTodos} of {todos.length} remaining
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Toolbar for Task List */}
      <AIToolbar
        selectedText={selectedTasksText}
        onExtractTasks={addMultipleTodos}
        className="mb-4"
      />

      {/* Tasks List */}
      <div ref={tasksContainerRef} className="space-y-3">
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
          <Card className="shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {filter === 'all' 
                  ? 'No tasks yet' 
                  : filter === 'active' 
                  ? 'No active tasks' 
                  : 'No completed tasks'
                }
              </h3>
              {filter === 'all' && (
                <p className="text-slate-500">Add your first task above to get started</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
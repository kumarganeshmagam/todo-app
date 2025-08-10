'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, FileText, Edit, ListPlus, Newspaper } from 'lucide-react'
import { aiManager } from '@/lib/ai'

interface AIToolbarProps {
  selectedText?: string
  onSummarize?: (summary: string) => void
  onRewriteFormat?: (rewritten: string) => void
  onFormatAsBlog?: (formatted: string) => void
  onExtractTasks?: (tasks: string[]) => void
  disabled?: boolean
  className?: string
}

export default function AIToolbar({ 
  selectedText = '', 
  onSummarize, 
  onRewriteFormat, 
  onFormatAsBlog,
  onExtractTasks,
  disabled = false,
  className = '' 
}: AIToolbarProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSummarize = async () => {
    if (!selectedText.trim() || !onSummarize) return
    
    setLoading('summarize')
    try {
      const summary = await aiManager.summarizeWithFallback(selectedText)
      onSummarize(summary)
    } finally {
      setLoading(null)
    }
  }

  const handleRewriteFormat = async () => {
    if (!selectedText.trim() || !onRewriteFormat) return
    
    setLoading('rewrite')
    try {
      const rewritten = await aiManager.rewriteAndFormatWithFallback(selectedText)
      onRewriteFormat(rewritten)
    } finally {
      setLoading(null)
    }
  }

  const handleFormatAsBlog = async () => {
    if (!selectedText.trim() || !onFormatAsBlog) return
    
    setLoading('blog')
    try {
      const formatted = await aiManager.formatAsBlogPostWithFallback(selectedText)
      onFormatAsBlog(formatted)
    } finally {
      setLoading(null)
    }
  }

  const handleExtractTasks = async () => {
    if (!selectedText.trim() || !onExtractTasks) return
    
    setLoading('tasks')
    try {
      const tasks = await aiManager.extractTasksWithFallback(selectedText)
      onExtractTasks(tasks)
    } finally {
      setLoading(null)
    }
  }

  const hasSelectedText = selectedText.trim().length > 0
  const isLoading = loading !== null

  return (
    <div className={`flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg ${className}`}>
      <Sparkles className="h-4 w-4 text-purple-600" />
      <span className="text-sm text-purple-700 font-medium">AI Assistant</span>
      
      <div className="flex items-center gap-1 ml-2">
        {onSummarize && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSummarize}
            disabled={!hasSelectedText || disabled || isLoading}
            className="h-8 px-2 text-xs"
          >
            {loading === 'summarize' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            <span className="ml-1">Summarize</span>
          </Button>
        )}
        
        {onRewriteFormat && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRewriteFormat}
            disabled={!hasSelectedText || disabled || isLoading}
            className="h-8 px-2 text-xs"
          >
            {loading === 'rewrite' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Edit className="h-3 w-3" />
            )}
            <span className="ml-1">Rewrite</span>
          </Button>
        )}
        
        {onFormatAsBlog && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFormatAsBlog}
            disabled={!hasSelectedText || disabled || isLoading}
            className="h-8 px-2 text-xs"
          >
            {loading === 'blog' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Newspaper className="h-3 w-3" />
            )}
            <span className="ml-1">Blog Format</span>
          </Button>
        )}
        
        {onExtractTasks && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExtractTasks}
            disabled={!hasSelectedText || disabled || isLoading}
            className="h-8 px-2 text-xs"
          >
            {loading === 'tasks' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ListPlus className="h-3 w-3" />
            )}
            <span className="ml-1">Extract Tasks</span>
          </Button>
        )}
      </div>
      
      {!hasSelectedText && (
        <span className="text-xs text-muted-foreground ml-auto">
          Select text to use AI features
        </span>
      )}
    </div>
  )
}
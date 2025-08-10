'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Bold, 
  Italic, 
  Underline,
  Highlighter,
  Save,
  Printer,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useTextSelection } from '@/hooks/use-text-selection'
import { Note } from '@/types'
import AIToolbar from '@/components/ai-toolbar'

interface NoteEditorProps {
  note: Note
  onUpdate: (id: string, updates: Partial<Note>) => void
  onDelete: (id: string) => void
  onClose: () => void
  onCreateNew: () => void
}

function NoteEditor({ note, onUpdate, onDelete, onClose, onCreateNew }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [contentHtml, setContentHtml] = useState(note.contentHtml)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const { selectedText, replaceSelection } = useTextSelection({ targetRef: contentRef })

  useEffect(() => {
    setTitle(note.title)
    setContentHtml(note.contentHtml)
    if (contentRef.current) {
      contentRef.current.innerHTML = note.contentHtml
    }
  }, [note.id])

  const isDirty = title !== note.title || contentHtml !== note.contentHtml

  function formatCommand(command: string, value?: string) {
    try {
      document.execCommand(command, false, value)
      if (contentRef.current) {
        setContentHtml(contentRef.current.innerHTML)
      }
    } catch {}
  }

  function handleSave() {
    onUpdate(note.id, { title, contentHtml, updatedAt: Date.now() })
  }

  function handlePrint() {
    const printWin = window.open('', '_blank')
    if (!printWin) return
    const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>${title || 'Untitled'}</title>
<style>
@page{size:A4;margin:12mm;}
body{font-family:system-ui,-apple-system,sans-serif;background:#fff;color:#000;line-height:1.6;}
.content{max-width:210mm;margin:0 auto;padding:20px;}
h1{font-size:24px;font-weight:600;margin:0 0 20px;}
</style></head><body><div class="content"><h1>${(title || 'Untitled').replace(/</g,'&lt;')}</h1><div>${contentHtml}</div></div></body></html>`
    printWin.document.open()
    printWin.document.write(html)
    printWin.document.close()
    printWin.focus()
    setTimeout(() => printWin.print(), 250)
  }

  function handleSummarize(summary: string) {
    if (replaceSelection(summary)) {
      if (contentRef.current) {
        setContentHtml(contentRef.current.innerHTML)
      }
    }
  }

  function handleRewriteFormat(rewritten: string) {
    // Check if the content contains HTML tags, if so render as HTML
    const containsHTML = /<[^>]+>/.test(rewritten)
    if (replaceSelection(rewritten, containsHTML)) {
      if (contentRef.current) {
        setContentHtml(contentRef.current.innerHTML)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="header-layout">
            <div className="title-container">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="title-input"
              />
            </div>
            <div className="button-group">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(note.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant={isDirty ? "default" : "secondary"}
                size="sm"
                disabled={!isDirty}
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="content-area">
            {/* AI Toolbar */}
            <AIToolbar
              selectedText={selectedText}
              onSummarize={handleSummarize}
              onRewriteFormat={handleRewriteFormat}
              className="mb-4"
            />
            
            {/* Toolbar */}
            <div className="toolbar">
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatCommand('bold')}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatCommand('italic')}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatCommand('underline')}
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatCommand('formatBlock', 'H1')}
                title="Heading 1"
              >
                H1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatCommand('formatBlock', 'H2')}
                title="Heading 2"
              >
                H2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatCommand('insertUnorderedList')}
                title="Bullet list"
              >
                • List
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  formatCommand('hiliteColor', '#fef08a')
                  formatCommand('backColor', '#fef08a')
                }}
                title="Highlight"
              >
                <Highlighter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handlePrint}
                title="Print"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor - A4-like sizing with scrolling */}
            <Card className="editor-container">
              <CardContent className="p-0">
                <div
                  ref={contentRef}
                  className="a4-editor"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => {
                    if (contentRef.current) {
                      setContentHtml(contentRef.current.innerHTML)
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                      e.preventDefault()
                      handleSave()
                    }
                  }}
                  style={{
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NotesView() {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', [])
  const [selectedId, setSelectedId] = useLocalStorage<string | null>('selected-note-id', null)
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>('notes-sidebar-open', true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [notes])

  // Auto-select first note only when there are notes but no explicit close action
  useEffect(() => {
    if (notes.length > 0 && !selectedId && !localStorage.getItem('notes-closed')) {
      setSelectedId(sortedNotes[0].id)
    }
  }, [notes.length, selectedId, sortedNotes])

  function addNote() {
    const note: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled',
      contentHtml: '',
      updatedAt: Date.now(),
    }
    setNotes((list) => [note, ...list])
    setSelectedId(note.id)
    setSidebarOpen(true)
    localStorage.removeItem('notes-closed')
  }

  function updateNote(id: string, updates: Partial<Note>) {
    setNotes((list) => list.map((n) => (n.id === id ? { ...n, ...updates } : n)))
  }

  function deleteNote(id: string) {
    setNotes((list) => list.filter((n) => n.id !== id))
    if (selectedId === id) {
      const remaining = notes.filter((n) => n.id !== id)
      setSelectedId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const selected = notes.find((n) => n.id === selectedId) || null

  // Don't render until hydrated to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-16 w-16 bg-muted rounded-full mx-auto"></div>
          </div>
          <div>
            <div className="h-6 bg-muted rounded w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!selected) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <Button onClick={addNote} size="lg" className="rounded-full h-16 w-16 p-0">
            <Plus className="h-8 w-8" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Create your first note</h3>
            <p className="text-muted-foreground">
              Start capturing your thoughts and ideas
            </p>
          </div>
          {sortedNotes.length > 0 && (
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-sm text-muted-foreground">Recent notes</p>
              {sortedNotes.slice(0, 5).map((note) => (
                <Card key={note.id} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                  localStorage.removeItem('notes-closed')
                  setSelectedId(note.id)
                }}>
                  <CardContent className="p-3">
                    <div className="text-sm font-medium truncate">{note.title || 'Untitled'}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      {selected && (
        <aside className={`${sidebarOpen ? 'w-64' : 'w-12'} transition-all duration-200 shrink-0`}>
          <div className="sticky top-20">
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full justify-start"
              >
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {sidebarOpen && <span className="ml-2">History</span>}
              </Button>
            </div>
            {sidebarOpen && (
              <div className="space-y-2">
                {sortedNotes.map((note) => (
                  <Card
                    key={note.id}
                    className={`cursor-pointer transition-colors ${
                      note.id === selectedId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      localStorage.removeItem('notes-closed')
                      setSelectedId(note.id)
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="text-sm font-medium truncate">{note.title || 'Untitled'}</div>
                      <div className="text-xs opacity-70">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main Editor */}
      <div className="flex-1">
        <NoteEditor
          note={selected}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onClose={() => {
            localStorage.setItem('notes-closed', 'true')
            setSelectedId(null)
          }}
          onCreateNew={addNote}
        />
      </div>
    </div>
  )
}
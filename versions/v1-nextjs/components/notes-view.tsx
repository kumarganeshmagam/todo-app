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
  ChevronRight
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Note } from '@/types'

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

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-lg font-semibold border-none bg-transparent p-0 focus:ring-0"
            />
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-muted rounded-md">
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
                onClick={() => {
                  formatCommand('hiliteColor', '#fef08a')
                  formatCommand('backColor', '#fef08a')
                }}
                title="Highlight"
              >
                <Highlighter className="h-4 w-4" />
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  title="Print"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Ctrl+B, I, U for formatting
                </span>
              </div>
            </div>

            {/* Editor */}
            <Card className="min-h-[500px]">
              <CardContent className="p-0">
                <div
                  ref={contentRef}
                  className="min-h-[500px] p-6 text-sm leading-relaxed outline-none"
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
                  style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
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

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [notes])

  useEffect(() => {
    if (notes.length > 0 && !selectedId) {
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
                <Card key={note.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedId(note.id)}>
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
                      note.id === selectedId ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedId(note.id)}
                  >
                    <CardContent className="p-3">
                      <div className="text-sm font-medium truncate">{note.title || 'Untitled'}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(note.updatedAt).toLocaleString()}
                      </div>
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            const newTitle = prompt('Rename note', note.title || 'Untitled')
                            if (newTitle != null) {
                              updateNote(note.id, { title: newTitle, updatedAt: Date.now() })
                            }
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
                          }}
                          className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Editor */}
      <div className="flex-1">
        <NoteEditor
          key={selected.id}
          note={selected}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onClose={() => setSelectedId(null)}
          onCreateNew={addNote}
        />
      </div>
    </div>
  )
}
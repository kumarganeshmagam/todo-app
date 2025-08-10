'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Bold, 
  Italic, 
  Underline,
  Highlighter,
  Link,
  Image,
  Code,
  Eye,
  EyeOff,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Save,
  X
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useTextSelection } from '@/hooks/use-text-selection'
import { Blog } from '@/types'
import AIToolbar from '@/components/ai-toolbar'

interface BlogEditorProps {
  blog: Blog
  onChange: (changes: Partial<Blog>) => void
  onDelete: () => void
  onClose: () => void
}

function BlogEditor({ blog, onChange, onDelete, onClose }: BlogEditorProps) {
  const [title, setTitle] = useState(blog.title)
  const [contentHtml, setContentHtml] = useState(blog.contentHtml)
  const [preview, setPreview] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const { selectedText, replaceSelection } = useTextSelection({ targetRef: editorRef })

  useEffect(() => {
    setTitle(blog.title)
    setContentHtml(blog.contentHtml)
    if (editorRef.current) {
      editorRef.current.innerHTML = blog.contentHtml
    }
    setIsDirty(false)
  }, [blog.id])

  // Ensure editor content is synced when switching from preview mode
  useEffect(() => {
    if (!preview && editorRef.current && editorRef.current.innerHTML !== contentHtml) {
      editorRef.current.innerHTML = contentHtml
    }
  }, [preview, contentHtml])

  // Check if content is dirty
  useEffect(() => {
    const dirty = title !== blog.title || contentHtml !== blog.contentHtml
    setIsDirty(dirty)
  }, [title, contentHtml, blog.title, blog.contentHtml])

  // Auto-save with debouncing
  useEffect(() => {
    if (!isDirty) return
    
    const id = setTimeout(() => {
      onChange({ title, contentHtml, updatedAt: Date.now() })
      setIsDirty(false)
    }, 1000)
    
    return () => clearTimeout(id)
  }, [title, contentHtml, isDirty, onChange])

  function handleSave() {
    onChange({ title, contentHtml, updatedAt: Date.now() })
    setIsDirty(false)
  }

  function exec(command: string, value?: string) {
    const el = editorRef.current
    if (!el) return
    el.focus()
    try {
      document.execCommand(command, false, value)
    } catch {}
    setContentHtml(el.innerHTML)
  }

  function insertLink() {
    const url = prompt('Enter URL', 'https://')
    if (!url) return
    exec('createLink', url)
  }

  function insertImageFromFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      exec('insertImage', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  function insertCodeBlock() {
    const el = editorRef.current
    if (!el) return
    el.focus()
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    const pre = document.createElement('pre')
    const code = document.createElement('code')
    code.textContent = selection.toString() || 'code'
    pre.appendChild(code)
    range.deleteContents()
    range.insertNode(pre)
    selection.removeAllRanges()
    setContentHtml(el.innerHTML)
  }

  function plainTextFromHtml(html: string) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return (tmp.textContent || tmp.innerText || '').trim()
  }

  const wordCount = plainTextFromHtml(contentHtml).split(/\s+/).filter(Boolean).length
  const readingTimeMin = Math.max(1, Math.round(wordCount / 200))

  function publishPreview() {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(`<!doctype html><html><head><meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #fff;
        color: #1f2937;
        margin: 0;
        padding: 60px 40px;
        line-height: 1.7;
      }
      .content { 
        max-width: 800px;
        margin: 0 auto;
      }
      h1 { 
        font-size: 2.5rem;
        font-weight: 800;
        color: #111827;
        margin: 0 0 1.5rem 0;
        line-height: 1.2;
      }
      h2 { 
        font-size: 1.875rem;
        font-weight: 700;
        color: #1f2937;
        margin: 2.5rem 0 1rem 0;
        line-height: 1.3;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 0.5rem;
      }
      h3 { 
        font-size: 1.5rem;
        font-weight: 600;
        color: #374151;
        margin: 2rem 0 1rem 0;
        line-height: 1.4;
      }
      p { 
        font-size: 1.125rem;
        margin: 1.5rem 0;
        color: #374151;
      }
      ul, ol { 
        margin: 1.5rem 0;
        padding-left: 2rem;
      }
      li { 
        font-size: 1.125rem;
        margin: 0.75rem 0;
        color: #374151;
        line-height: 1.6;
      }
      strong { 
        color: #111827;
        font-weight: 600;
      }
      em { 
        color: #4f46e5;
        font-style: italic;
      }
      blockquote {
        border-left: 4px solid #4f46e5;
        padding-left: 1.5rem;
        margin: 2rem 0;
        color: #6b7280;
        font-style: italic;
      }
      .meta {
        color: #9ca3af;
        font-size: 0.875rem;
        margin-bottom: 2rem;
        text-align: center;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 2rem;
      }
    </style>
    </head><body><article class="content">
      <h1>${(title||'Untitled').replace(/</g,'&lt;')}</h1>
      <div class="meta">${wordCount} words • ${readingTimeMin} min read</div>
      ${contentHtml}
    </article></body></html>`)
    w.document.close()
    w.focus()
  }

  function exportMarkdown() {
    const tmp = document.createElement('div')
    tmp.innerHTML = contentHtml
    let md = tmp.innerHTML
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '$1')
      .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
      .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n')
      .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n')
      .replace(/<br\s*\/?>(\n)?/gi, '\n')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
    
    const blob = new Blob([`# ${title}\n\n${md.trim()}\n`], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'post'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleSummarize(summary: string) {
    if (replaceSelection(summary)) {
      setContentHtml(editorRef.current?.innerHTML ?? '')
    }
  }

  function handleRewriteFormat(rewritten: string) {
    // Check if the content contains HTML tags, if so render as HTML
    const containsHTML = /<[^>]+>/.test(rewritten)
    if (replaceSelection(rewritten, containsHTML)) {
      setContentHtml(editorRef.current?.innerHTML ?? '')
    }
  }

  function handleFormatAsBlog(formatted: string) {
    if (replaceSelection(formatted, true)) { // Pass true to render as HTML
      setContentHtml(editorRef.current?.innerHTML ?? '')
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
                placeholder="Blog post title..."
                className="title-input"
              />
            </div>
            <div className="button-group">
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreview(!preview)}
              >
                {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-2">{preview ? 'Edit' : 'Preview'}</span>
              </Button>
              <Button
                size="sm"
                onClick={publishPreview}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportMarkdown}
              >
                <Download className="h-4 w-4 mr-2" />
                Export MD
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
            {!preview && (
              <AIToolbar
                selectedText={selectedText}
                onSummarize={handleSummarize}
                onRewriteFormat={handleRewriteFormat}
                onFormatAsBlog={handleFormatAsBlog}
                className="mb-4"
              />
            )}
            
            {/* Toolbar */}
            {!preview && (
              <div className="toolbar">
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('bold')}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('italic')}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('underline')}
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('formatBlock', 'H1')}
                  title="Heading 1"
                >
                  H1
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('formatBlock', 'H2')}
                  title="Heading 2"
                >
                  H2
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('insertUnorderedList')}
                  title="Bullet list"
                >
                  • List
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    exec('hiliteColor', '#fef08a')
                    exec('backColor', '#fef08a')
                  }}
                  title="Highlight"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={insertLink}
                  title="Link"
                >
                  <Link className="h-4 w-4" />
                </Button>
                <label className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer">
                  <Image className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) insertImageFromFile(f)
                    }}
                  />
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={insertCodeBlock}
                  title="Code"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec('removeFormat')}
                  title="Clear formatting"
                >
                  Clear
                </Button>
                <div className="ml-auto text-xs text-muted-foreground">
                  {wordCount} words • ~{readingTimeMin} min read
                </div>
              </div>
            )}

            {/* Editor/Preview - No height limit for blogs */}
            <Card className="min-h-[600px]">
              <CardContent className="p-0">
                {preview ? (
                  <article
                    className="prose prose-slate prose-lg max-w-none p-8 min-h-[600px]"
                    style={{
                      fontSize: '1.125rem',
                      lineHeight: '1.7'
                    }}
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                ) : (
                  <div
                    ref={editorRef}
                    className="blog-editor text-sm leading-relaxed outline-none prose prose-slate max-w-none"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={() => setContentHtml(editorRef.current?.innerHTML ?? '')}
                    style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BlogsView() {
  const [blogs, setBlogs] = useLocalStorage<Blog[]>('blogs', [])
  const [selectedId, setSelectedId] = useLocalStorage<string | null>('selected-blog-id', null)
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>('blogs-sidebar-open', true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const sortedBlogs = useMemo(() => {
    return [...blogs].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [blogs])

  function createBlog() {
    const blog: Blog = {
      id: crypto.randomUUID(),
      title: 'Untitled Blog Post',
      contentHtml: '',
      updatedAt: Date.now(),
    }
    setBlogs((list) => [blog, ...list])
    setSelectedId(blog.id)
    setSidebarOpen(true)
  }

  function updateBlog(id: string, updates: Partial<Blog>) {
    setBlogs((list) => list.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  function deleteBlog(id: string) {
    setBlogs((list) => list.filter((b) => b.id !== id))
    if (selectedId === id) {
      const remaining = blogs.filter((b) => b.id !== id)
      setSelectedId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const selected = blogs.find((b) => b.id === selectedId) || null

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
          <Button onClick={createBlog} size="lg" className="rounded-full h-16 w-16 p-0">
            <Plus className="h-8 w-8" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Create your first blog post</h3>
            <p className="text-muted-foreground">
              Start writing and sharing your thoughts
            </p>
          </div>
          {sortedBlogs.length > 0 && (
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-sm text-muted-foreground">Recent blog posts</p>
              {sortedBlogs.slice(0, 5).map((blog) => (
                <Card key={blog.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedId(blog.id)}>
                  <CardContent className="p-3">
                    <div className="text-sm font-medium truncate">{blog.title || 'Untitled'}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(blog.updatedAt).toLocaleDateString()}
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
                {sortedBlogs.map((blog) => (
                  <Card
                    key={blog.id}
                    className={`cursor-pointer transition-colors ${
                      blog.id === selectedId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedId(blog.id)}
                  >
                    <CardContent className="p-3">
                      <div className="text-sm font-medium truncate">{blog.title || 'Untitled'}</div>
                      <div className="text-xs opacity-70">
                        {new Date(blog.updatedAt).toLocaleDateString()}
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
        <BlogEditor
          blog={selected}
          onChange={(changes) => updateBlog(selected.id, changes)}
          onDelete={() => deleteBlog(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  )
}
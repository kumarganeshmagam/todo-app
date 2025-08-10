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
  ChevronRight
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Blog } from '@/types'

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
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setTitle(blog.title)
    setContentHtml(blog.contentHtml)
    if (editorRef.current) {
      editorRef.current.innerHTML = blog.contentHtml
    }
  }, [blog.id])

  // Auto-save
  useEffect(() => {
    const id = setTimeout(() => onChange({ title, contentHtml, updatedAt: Date.now() }), 300)
    return () => clearTimeout(id)
  }, [title, contentHtml, onChange])

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
    <style>body{font-family:system-ui,-apple-system,sans-serif;background:#fff;color:#1f2937;margin:40px;line-height:1.6}h1,h2,h3{margin:20px 0 12px} .content{max-width:760px;margin:0 auto}</style>
    </head><body><article class="content"><h1>${(title||'Untitled').replace(/</g,'&lt;')}</h1>${contentHtml}</article></body></html>`)
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

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog post title..."
              className="text-lg font-semibold border-none bg-transparent p-0 focus:ring-0"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
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
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Toolbar */}
            {!preview && (
              <div className="flex items-center gap-1 p-2 bg-muted rounded-md flex-wrap">
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

            {/* Editor/Preview */}
            <Card className="min-h-[600px]">
              <CardContent className="p-0">
                {preview ? (
                  <article
                    className="prose prose-slate max-w-none p-8 min-h-[600px]"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                ) : (
                  <div
                    ref={editorRef}
                    className="min-h-[600px] p-8 text-sm leading-relaxed outline-none prose prose-slate max-w-none"
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

  const sorted = useMemo(() => [...blogs].sort((a, b) => b.updatedAt - a.updatedAt), [blogs])
  const selected = blogs.find((b) => b.id === selectedId) || null

  function createBlog() {
    const post: Blog = { 
      id: crypto.randomUUID(), 
      title: 'Untitled', 
      contentHtml: '', 
      updatedAt: Date.now() 
    }
    setBlogs((list) => [post, ...list])
    setSelectedId(post.id)
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

  if (!selected) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <Button onClick={createBlog} size="lg" className="rounded-full h-16 w-16 p-0">
            <Plus className="h-8 w-8" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Write your first blog post</h3>
            <p className="text-muted-foreground">
              Share your thoughts and ideas with the world
            </p>
          </div>
          {sorted.length > 0 && (
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-sm text-muted-foreground">Recent posts</p>
              {sorted.slice(0, 5).map((blog) => (
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
                {sidebarOpen && <span className="ml-2">Posts</span>}
              </Button>
            </div>

            {sidebarOpen && (
              <div className="space-y-2">
                {sorted.map((blog) => (
                  <Card
                    key={blog.id}
                    className={`cursor-pointer transition-colors group ${
                      blog.id === selectedId ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedId(blog.id)}
                  >
                    <CardContent className="p-3">
                      <div className="text-sm font-medium truncate">{blog.title || 'Untitled'}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(blog.updatedAt).toLocaleString()}
                      </div>
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            const newTitle = prompt('Rename blog post', blog.title || 'Untitled')
                            if (newTitle != null) {
                              updateBlog(blog.id, { title: newTitle, updatedAt: Date.now() })
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
                            deleteBlog(blog.id)
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
        <BlogEditor
          key={selected.id}
          blog={selected}
          onChange={(changes) => updateBlog(selected.id, changes)}
          onDelete={() => deleteBlog(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  )
}
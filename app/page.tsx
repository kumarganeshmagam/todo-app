'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TasksView from '@/components/tasks-view'
import NotesView from '@/components/notes-view'
import BlogsView from '@/components/blogs-view'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Tabs defaultValue="tasks" className="min-h-screen">
        {/* Modern Header */}
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"></div>
                <h1 className="text-2xl font-light text-slate-900 tracking-tight">Focus</h1>
              </div>
              
              {/* Tab Navigation in Header */}
              <TabsList className="grid grid-cols-3 bg-slate-100/70 rounded-xl p-1 backdrop-blur">
                <TabsTrigger 
                  value="tasks" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="notes"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  Notes
                </TabsTrigger>
                <TabsTrigger 
                  value="blogs"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  Blogs
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </header>

        {/* Clean Content Area */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <TabsContent value="tasks">
              <TasksView />
            </TabsContent>
            <TabsContent value="notes">
              <NotesView />
            </TabsContent>
            <TabsContent value="blogs">
              <BlogsView />
            </TabsContent>
          </div>
        </main>
      </Tabs>
    </div>
  )
}
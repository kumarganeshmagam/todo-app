'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TasksView from '@/components/tasks-view'
import NotesView from '@/components/notes-view'
import BlogsView from '@/components/blogs-view'

export default function Home() {
  const [activeTab, setActiveTab] = useState('tasks')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <h1 className="text-xl font-semibold">Focus</h1>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="blogs">Blogs</TabsTrigger>
                </TabsList>
              </Tabs>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="tasks" className="space-y-4">
            <TasksView />
          </TabsContent>
          <TabsContent value="notes" className="space-y-4">
            <NotesView />
          </TabsContent>
          <TabsContent value="blogs" className="space-y-4">
            <BlogsView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
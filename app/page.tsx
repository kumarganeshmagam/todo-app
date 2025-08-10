'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TasksView from '@/components/tasks-view'
import NotesView from '@/components/notes-view'
import BlogsView from '@/components/blogs-view'
import { UserMenu } from '@/components/user-menu'
import { AccountView } from '@/components/account-view'
import { SettingsView } from '@/components/settings-view'
import { useMigration } from '@/hooks/use-migration'
import { useAISettings } from '@/hooks/use-ai-settings'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()
  const { isMigrating } = useMigration()
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("tasks")
  useAISettings() // Auto-load AI settings based on user session

  // Prevent hydration mismatches by waiting for client-side mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Switch to tasks tab when user logs in (if they're on account tab)
  useEffect(() => {
    if (session && activeTab === "account") {
      setActiveTab("tasks")
    }
  }, [session, activeTab])

  // Handle tab changes - prevent accessing account tab when logged in
  const handleTabChange = (newTab: string) => {
    if (session && newTab === "account") {
      // If user tries to access account tab while logged in, redirect to tasks
      setActiveTab("tasks")
    } else {
      setActiveTab(newTab)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="min-h-screen">
        {/* Modern Header */}
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"></div>
                <h1 className="text-2xl font-light text-slate-900 tracking-tight">Focus</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {isMigrating && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Migrating your data...</span>
                  </div>
                )}
                <UserMenu />
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              {/* Tab Navigation in Header */}
              <TabsList className="grid grid-cols-4 bg-slate-100/70 rounded-xl p-1 backdrop-blur">
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
{isMounted && (
                  !session ? (
                    <TabsTrigger 
                      value="account"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                      Account
                    </TabsTrigger>
                  ) : (
                    <TabsTrigger 
                      value="settings"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                      Settings
                    </TabsTrigger>
                  )
                )}
                {!isMounted && (
                  <TabsTrigger 
                    value="account"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    Account
                  </TabsTrigger>
                )}
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
{isMounted && (
              <>
                {!session && (
                  <TabsContent value="account">
                    <AccountView />
                  </TabsContent>
                )}
                {session && (
                  <TabsContent value="settings">
                    <SettingsView />
                  </TabsContent>
                )}
              </>
            )}
            {!isMounted && (
              <TabsContent value="account">
                <AccountView />
              </TabsContent>
            )}
          </div>
        </main>
      </Tabs>
    </div>
  )
}
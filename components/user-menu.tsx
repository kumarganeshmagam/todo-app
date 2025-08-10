'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { User, LogOut, Loader2 } from 'lucide-react'

export function UserMenu() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <Loader2 className="h-4 w-4 animate-spin" />
  }

  if (session) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm text-slate-600">
          {session.user?.name || session.user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-slate-500">
        Go to Account tab to sign in
      </span>
      <User className="h-4 w-4 text-slate-400" />
    </div>
  )
}
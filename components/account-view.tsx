'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { User, Loader2, Key, Shield, Database, Sparkles } from 'lucide-react'

export function AccountView() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      if (result?.ok) {
        setEmail('')
        setPassword('')
        // Migration will be handled automatically by the useMigration hook
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mx-auto mb-4 flex items-center justify-center">
          <User className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-light text-slate-900 mb-2">Welcome to Focus</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Create an account to sync your data across devices and unlock powerful AI features with your own API keys.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Authentication Form */}
        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
            <p className="text-sm text-slate-600">
              {isSignUp 
                ? 'Join to sync your data and add custom AI providers'
                : 'Access your synced data and AI settings'
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </Button>

              <Separator />

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Create one"
                  }
                </button>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Your data is safe:</strong> All existing todos, notes, and blogs will be automatically migrated to your account.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <div className="space-y-4">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Database className="h-5 w-5" />
                Sync Across Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                Access your todos, notes, and blogs from any device. Your data is securely stored and automatically synced.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Sparkles className="h-5 w-5" />
                Custom AI Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700 mb-3">
                Add your own API keys for enhanced AI features:
              </p>
              <ul className="text-xs text-purple-600 space-y-1">
                <li>• OpenAI GPT-4 for advanced text processing</li>
                <li>• Claude for nuanced writing assistance</li>
                <li>• Gemini for creative content generation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Key className="h-5 w-5" />
                Secure & Private
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700">
                Your API keys are encrypted and stored securely. Only you have access to your data and settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Continue Without Account */}
      <div className="text-center py-4">
        <p className="text-sm text-slate-500">
          Want to keep using Focus without an account? You can continue with local storage only.
          <br />
          <span className="text-xs">Note: Your data won't sync across devices and AI features will be limited to Ollama only.</span>
        </p>
      </div>
    </div>
  )
}
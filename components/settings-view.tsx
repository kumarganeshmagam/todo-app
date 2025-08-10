'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Settings, Key, Sparkles, Save, Eye, EyeOff, User, Database, Loader2 } from 'lucide-react'
import { aiManager } from '@/lib/ai'

interface UserSettings {
  openaiKey?: string
  claudeKey?: string
  geminiKey?: string
  preferredAI?: string
}

export function SettingsView() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<UserSettings>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showKeys, setShowKeys] = useState({
    openai: false,
    claude: false,
    gemini: false
  })

  // Load user settings
  useEffect(() => {
    if (session?.user?.id) {
      setIsLoading(true)
      fetch('/api/user/settings')
        .then(res => res.ok ? res.json() : {})
        .then(data => {
          setSettings(data || {})
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    }
  }, [session?.user?.id])

  const handleSave = async () => {
    if (!session?.user?.id) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        // Update AI manager with new settings
        aiManager.updateUserSettings(settings)
        // Show success feedback
        console.log('Settings saved successfully')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleKeyVisibility = (provider: 'openai' | 'claude' | 'gemini') => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }))
  }

  const maskKey = (key?: string) => {
    if (!key || key.length < 8) return key
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        <span className="ml-2 text-slate-600">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg mx-auto mb-4 flex items-center justify-center">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-light text-slate-900 mb-2">Settings</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Manage your account preferences and API keys for enhanced AI features.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="bg-slate-50"
              />
            </div>
            
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                value={session?.user?.name || session?.user?.email || ''}
                disabled
                className="bg-slate-50"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <Database className="h-4 w-4 inline mr-1" />
                <strong>Data Status:</strong> Your todos, notes, and blogs are synced to your account and available across all your devices.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Provider Settings */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Sparkles className="h-5 w-5" />
              AI Provider Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="preferred-ai">Preferred AI Provider</Label>
              <select
                id="preferred-ai"
                value={settings.preferredAI || 'ollama'}
                onChange={(e) => setSettings(prev => ({ ...prev, preferredAI: e.target.value }))}
                className="w-full mt-1 p-2 border border-purple-200 rounded-md bg-white/70"
              >
                <option value="ollama">Ollama (Local)</option>
                <option value="openai">OpenAI GPT</option>
                <option value="claude">Claude</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            <div className="bg-purple-100 p-3 rounded-lg">
              <p className="text-xs text-purple-700">
                <strong>Note:</strong> Ollama runs locally and is always available. Other providers require API keys.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Section */}
      <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-amber-600" />
            API Keys Management
          </CardTitle>
          <p className="text-sm text-slate-600">
            Add your API keys to use advanced AI providers. Keys are encrypted and stored securely.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI API Key */}
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <div className="flex gap-2">
              <Input
                id="openai-key"
                type={showKeys.openai ? 'text' : 'password'}
                placeholder="sk-..."
                value={showKeys.openai ? (settings.openaiKey || '') : maskKey(settings.openaiKey)}
                onChange={(e) => setSettings(prev => ({ ...prev, openaiKey: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleKeyVisibility('openai')}
              >
                {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Claude API Key */}
          <div className="space-y-2">
            <Label htmlFor="claude-key">Claude API Key</Label>
            <div className="flex gap-2">
              <Input
                id="claude-key"
                type={showKeys.claude ? 'text' : 'password'}
                placeholder="sk-ant-..."
                value={showKeys.claude ? (settings.claudeKey || '') : maskKey(settings.claudeKey)}
                onChange={(e) => setSettings(prev => ({ ...prev, claudeKey: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleKeyVisibility('claude')}
              >
                {showKeys.claude ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-2">
            <Label htmlFor="gemini-key">Google Gemini API Key</Label>
            <div className="flex gap-2">
              <Input
                id="gemini-key"
                type={showKeys.gemini ? 'text' : 'password'}
                placeholder="AI..."
                value={showKeys.gemini ? (settings.geminiKey || '') : maskKey(settings.geminiKey)}
                onChange={(e) => setSettings(prev => ({ ...prev, geminiKey: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleKeyVisibility('gemini')}
              >
                {showKeys.gemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="min-w-32">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Key Information */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-800 mb-2">OpenAI GPT</h4>
            <p className="text-xs text-green-700">
              Access GPT-4 and other OpenAI models for advanced text processing and generation.
            </p>
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              className="text-xs text-green-600 hover:underline mt-2 inline-block"
            >
              Get API Key →
            </a>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-orange-800 mb-2">Claude</h4>
            <p className="text-xs text-orange-700">
              Use Anthropic's Claude for nuanced writing assistance and analysis.
            </p>
            <a 
              href="https://console.anthropic.com/" 
              target="_blank" 
              className="text-xs text-orange-600 hover:underline mt-2 inline-block"
            >
              Get API Key →
            </a>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-800 mb-2">Google Gemini</h4>
            <p className="text-xs text-blue-700">
              Leverage Google's Gemini for creative content generation and analysis.
            </p>
            <a 
              href="https://makersuite.google.com/app/apikey" 
              target="_blank" 
              className="text-xs text-blue-600 hover:underline mt-2 inline-block"
            >
              Get API Key →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
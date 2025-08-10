import { Todo } from '@/types'

export interface AIResponse {
  success: boolean
  content?: string
  error?: string
}

export interface AIProvider {
  summarize: (content: string) => Promise<AIResponse>
  rewriteAndFormat: (content: string) => Promise<AIResponse>
  formatAsBlogPost: (content: string) => Promise<AIResponse>
  extractTasks: (content: string) => Promise<{ tasks: string[], success: boolean, error?: string }>
  speechToTask: (text: string) => Promise<{ task: string, success: boolean, error?: string }>
}

export class OllamaProvider implements AIProvider {
  private readonly baseUrl: string
  private readonly model: string

  constructor(baseUrl = 'http://localhost:11434', model = 'llama2:latest') {
    this.baseUrl = baseUrl
    this.model = model
  }

  private async makeRequest(prompt: string): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return { success: true, content: data.response }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async summarize(content: string): Promise<AIResponse> {
    const prompt = `Summarize the following content concisely, maintaining the key points and structure:

${content}

Summary:`

    return this.makeRequest(prompt)
  }

  async rewriteAndFormat(content: string): Promise<AIResponse> {
    const prompt = `Rewrite and format the following content to be clear, well-structured, and professional. Improve grammar, readability, and organization:

${content}

Formatted content:`

    return this.makeRequest(prompt)
  }

  async formatAsBlogPost(content: string): Promise<AIResponse> {
    const prompt = `Transform the following content into a professionally formatted blog post. Keep ALL the original information and ideas, just organize them better with proper structure and formatting.

IMPORTANT RULES:
- DO NOT remove any points, ideas, or information
- ADD proper headings and structure 
- PRESERVE all bullet points as HTML lists
- KEEP all side headings and subheadings
- ENHANCE the content, don't reduce it

Format using clean HTML:
- <h2> for main sections (not h1, that's for the title)
- <h3> for subsections and side headings
- <h4> for smaller subheadings
- <p> for paragraphs
- <ul><li> for bullet points
- <ol><li> for numbered lists
- <strong> for important terms
- <em> for emphasis

Content to enhance:
${content}

Enhanced blog post content:`

    return this.makeRequest(prompt)
  }

  async extractTasks(content: string): Promise<{ tasks: string[], success: boolean, error?: string }> {
    const prompt = `Extract actionable tasks from the following content. Return only the task items, one per line, without numbers or bullet points:

${content}

Tasks:`

    try {
      const response = await this.makeRequest(prompt)
      if (!response.success) {
        return { tasks: [], success: false, error: response.error }
      }

      const tasks = response.content?.split('\n')
        .map(task => task.trim())
        .filter(task => task.length > 0)
        || []

      return { tasks, success: true }
    } catch (error) {
      return { 
        tasks: [], 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async speechToTask(text: string): Promise<{ task: string, success: boolean, error?: string }> {
    const prompt = `Convert the following speech or text into a clear, actionable task:

"${text}"

Task:`

    try {
      const response = await this.makeRequest(prompt)
      if (!response.success) {
        return { task: '', success: false, error: response.error }
      }

      return { task: response.content?.trim() || '', success: true }
    } catch (error) {
      return { 
        task: '', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// OpenAI Provider Implementation
export class OpenAIProvider implements AIProvider {
  private readonly apiKey: string
  private readonly model: string
  private readonly baseUrl: string

  constructor(apiKey: string, model = 'gpt-4', baseUrl = 'https://api.openai.com/v1') {
    this.apiKey = apiKey
    this.model = model
    this.baseUrl = baseUrl
  }

  private async makeRequest(messages: Array<{role: string, content: string}>): Promise<AIResponse> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'OpenAI API key not configured' }
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        const error = await response.text()
        return { success: false, error: `OpenAI API error: ${response.status}` }
      }

      const data = await response.json()
      return { success: true, content: data.choices[0]?.message?.content || '' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'OpenAI request failed' 
      }
    }
  }

  async summarize(content: string): Promise<AIResponse> {
    const messages = [{
      role: 'user',
      content: `Summarize the following content concisely, maintaining the key points and structure:\n\n${content}\n\nSummary:`
    }]
    return this.makeRequest(messages)
  }

  async rewriteAndFormat(content: string): Promise<AIResponse> {
    const messages = [{
      role: 'user',
      content: `Rewrite and format the following content to be clear, well-structured, and professional. Improve grammar, readability, and organization:\n\n${content}\n\nFormatted content:`
    }]
    return this.makeRequest(messages)
  }

  async formatAsBlogPost(content: string): Promise<AIResponse> {
    const messages = [{
      role: 'user',
      content: `Transform the following content into a professionally formatted blog post. Keep ALL the original information and ideas, just organize them better with proper structure and formatting.

IMPORTANT RULES:
- DO NOT remove any points, ideas, or information
- ADD proper headings and structure 
- PRESERVE all bullet points as HTML lists
- KEEP all side headings and subheadings
- ENHANCE the content, don't reduce it

Format using clean HTML:
- <h2> for main sections (not h1, that's for the title)
- <h3> for subsections and side headings
- <h4> for smaller subheadings
- <p> for paragraphs
- <ul><li> for bullet points
- <ol><li> for numbered lists
- <strong> for important terms
- <em> for emphasis

Content to enhance:
${content}

Enhanced blog post content:`
    }]
    return this.makeRequest(messages)
  }

  async extractTasks(content: string): Promise<{ tasks: string[], success: boolean, error?: string }> {
    const messages = [{
      role: 'user',
      content: `Extract actionable tasks from the following content. Return only the task items, one per line, without numbers or bullet points:\n\n${content}\n\nTasks:`
    }]

    try {
      const response = await this.makeRequest(messages)
      if (!response.success) {
        return { tasks: [], success: false, error: response.error }
      }

      const tasks = response.content?.split('\n')
        .map(task => task.trim())
        .filter(task => task.length > 0)
        || []

      return { tasks, success: true }
    } catch (error) {
      return { 
        tasks: [], 
        success: false, 
        error: error instanceof Error ? error.message : 'OpenAI task extraction failed' 
      }
    }
  }

  async speechToTask(text: string): Promise<{ task: string, success: boolean, error?: string }> {
    const messages = [{
      role: 'user',
      content: `Convert the following speech or text into a clear, actionable task:\n\n"${text}"\n\nTask:`
    }]

    try {
      const response = await this.makeRequest(messages)
      if (!response.success) {
        return { task: '', success: false, error: response.error }
      }

      return { task: response.content?.trim() || '', success: true }
    } catch (error) {
      return { 
        task: '', 
        success: false, 
        error: error instanceof Error ? error.message : 'OpenAI speech-to-task failed' 
      }
    }
  }
}

// Claude Provider Implementation
export class ClaudeProvider implements AIProvider {
  private readonly apiKey: string
  private readonly model: string
  private readonly baseUrl: string

  constructor(apiKey: string, model = 'claude-3-sonnet-20240229', baseUrl = 'https://api.anthropic.com/v1') {
    this.apiKey = apiKey
    this.model = model
    this.baseUrl = baseUrl
  }

  private async makeRequest(prompt: string): Promise<AIResponse> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'Claude API key not configured' }
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2000,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        return { success: false, error: `Claude API error: ${response.status}` }
      }

      const data = await response.json()
      return { success: true, content: data.content[0]?.text || '' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Claude request failed' 
      }
    }
  }

  async summarize(content: string): Promise<AIResponse> {
    const prompt = `Summarize the following content concisely, maintaining the key points and structure:\n\n${content}\n\nSummary:`
    return this.makeRequest(prompt)
  }

  async rewriteAndFormat(content: string): Promise<AIResponse> {
    const prompt = `Rewrite and format the following content to be clear, well-structured, and professional. Improve grammar, readability, and organization:\n\n${content}\n\nFormatted content:`
    return this.makeRequest(prompt)
  }

  async formatAsBlogPost(content: string): Promise<AIResponse> {
    const prompt = `Transform the following content into a professionally formatted blog post. Keep ALL the original information and ideas, just organize them better with proper structure and formatting.

IMPORTANT RULES:
- DO NOT remove any points, ideas, or information
- ADD proper headings and structure 
- PRESERVE all bullet points as HTML lists
- KEEP all side headings and subheadings
- ENHANCE the content, don't reduce it

Format using clean HTML:
- <h2> for main sections (not h1, that's for the title)
- <h3> for subsections and side headings
- <h4> for smaller subheadings
- <p> for paragraphs
- <ul><li> for bullet points
- <ol><li> for numbered lists
- <strong> for important terms
- <em> for emphasis

Content to enhance:
${content}

Enhanced blog post content:`
    return this.makeRequest(prompt)
  }

  async extractTasks(content: string): Promise<{ tasks: string[], success: boolean, error?: string }> {
    const prompt = `Extract actionable tasks from the following content. Return only the task items, one per line, without numbers or bullet points:\n\n${content}\n\nTasks:`

    try {
      const response = await this.makeRequest(prompt)
      if (!response.success) {
        return { tasks: [], success: false, error: response.error }
      }

      const tasks = response.content?.split('\n')
        .map(task => task.trim())
        .filter(task => task.length > 0)
        || []

      return { tasks, success: true }
    } catch (error) {
      return { 
        tasks: [], 
        success: false, 
        error: error instanceof Error ? error.message : 'Claude task extraction failed' 
      }
    }
  }

  async speechToTask(text: string): Promise<{ task: string, success: boolean, error?: string }> {
    const prompt = `Convert the following speech or text into a clear, actionable task:\n\n"${text}"\n\nTask:`

    try {
      const response = await this.makeRequest(prompt)
      if (!response.success) {
        return { task: '', success: false, error: response.error }
      }

      return { task: response.content?.trim() || '', success: true }
    } catch (error) {
      return { 
        task: '', 
        success: false, 
        error: error instanceof Error ? error.message : 'Claude speech-to-task failed' 
      }
    }
  }
}

// Gemini Provider Implementation  
export class GeminiProvider implements AIProvider {
  private readonly apiKey: string
  private readonly model: string
  private readonly baseUrl: string

  constructor(apiKey: string, model = 'gemini-1.5-flash', baseUrl = 'https://generativelanguage.googleapis.com/v1beta') {
    this.apiKey = apiKey
    this.model = model
    this.baseUrl = baseUrl
  }

  private async makeRequest(prompt: string): Promise<AIResponse> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'Gemini API key not configured' }
      }

      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000
          }
        })
      })

      if (!response.ok) {
        const error = await response.text()
        return { success: false, error: `Gemini API error: ${response.status}` }
      }

      const data = await response.json()
      return { success: true, content: data.candidates?.[0]?.content?.parts?.[0]?.text || '' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Gemini request failed' 
      }
    }
  }

  async summarize(content: string): Promise<AIResponse> {
    const prompt = `Summarize the following content concisely, maintaining the key points and structure:\n\n${content}\n\nSummary:`
    return this.makeRequest(prompt)
  }

  async rewriteAndFormat(content: string): Promise<AIResponse> {
    const prompt = `Rewrite and format the following content to be clear, well-structured, and professional. Improve grammar, readability, and organization:\n\n${content}\n\nFormatted content:`
    return this.makeRequest(prompt)
  }

  async formatAsBlogPost(content: string): Promise<AIResponse> {
    const prompt = `Transform the following content into a professionally formatted blog post. Keep ALL the original information and ideas, just organize them better with proper structure and formatting.

IMPORTANT RULES:
- DO NOT remove any points, ideas, or information
- ADD proper headings and structure 
- PRESERVE all bullet points as HTML lists
- KEEP all side headings and subheadings
- ENHANCE the content, don't reduce it

Format using clean HTML:
- <h2> for main sections (not h1, that's for the title)
- <h3> for subsections and side headings
- <h4> for smaller subheadings
- <p> for paragraphs
- <ul><li> for bullet points
- <ol><li> for numbered lists
- <strong> for important terms
- <em> for emphasis

Content to enhance:
${content}

Enhanced blog post content:`
    return this.makeRequest(prompt)
  }

  async extractTasks(content: string): Promise<{ tasks: string[], success: boolean, error?: string }> {
    const prompt = `Extract actionable tasks from the following content. Return only the task items, one per line, without numbers or bullet points:\n\n${content}\n\nTasks:`

    try {
      const response = await this.makeRequest(prompt)
      if (!response.success) {
        return { tasks: [], success: false, error: response.error }
      }

      const tasks = response.content?.split('\n')
        .map(task => task.trim())
        .filter(task => task.length > 0)
        || []

      return { tasks, success: true }
    } catch (error) {
      return { 
        tasks: [], 
        success: false, 
        error: error instanceof Error ? error.message : 'Gemini task extraction failed' 
      }
    }
  }

  async speechToTask(text: string): Promise<{ task: string, success: boolean, error?: string }> {
    const prompt = `Convert the following speech or text into a clear, actionable task:\n\n"${text}"\n\nTask:`

    try {
      const response = await this.makeRequest(prompt)
      if (!response.success) {
        return { task: '', success: false, error: response.error }
      }

      return { task: response.content?.trim() || '', success: true }
    } catch (error) {
      return { 
        task: '', 
        success: false, 
        error: error instanceof Error ? error.message : 'Gemini speech-to-task failed' 
      }
    }
  }
}

// AI Manager to handle provider selection and fallbacks
export class AIManager {
  private provider: AIProvider
  private fallbackMessage = "This functionality is not available right now."

  constructor(provider: AIProvider = new OllamaProvider()) {
    this.provider = provider
  }

  setProvider(provider: AIProvider) {
    this.provider = provider
  }

  async summarizeWithFallback(content: string): Promise<string> {
    try {
      const response = await this.provider.summarize(content)
      if (response.success) {
        return response.content || content
      } else {
        // Show a more user-friendly alert
        alert('AI summarization is not available right now. Please try again later or sign in to use your own AI API keys.')
        return content // Return original content
      }
    } catch (error) {
      console.error('AI summarization error:', error)
      alert('AI summarization is not available right now. Please try again later or sign in to use your own AI API keys.')
      return content // Return original content
    }
  }

  async rewriteAndFormatWithFallback(content: string): Promise<string> {
    try {
      const response = await this.provider.rewriteAndFormat(content)
      if (response.success) {
        return response.content || content
      } else {
        alert(this.fallbackMessage)
        return content // Return original content
      }
    } catch {
      alert(this.fallbackMessage)
      return content // Return original content
    }
  }

  async formatAsBlogPostWithFallback(content: string): Promise<string> {
    try {
      const response = await this.provider.formatAsBlogPost(content)
      if (response.success) {
        return response.content || content
      } else {
        alert(this.fallbackMessage)
        return content // Return original content
      }
    } catch {
      alert(this.fallbackMessage)
      return content // Return original content
    }
  }

  async extractTasksWithFallback(content: string): Promise<string[]> {
    try {
      const response = await this.provider.extractTasks(content)
      return response.success ? response.tasks : []
    } catch {
      return []
    }
  }

  async speechToTaskWithFallback(text: string): Promise<string> {
    try {
      const response = await this.provider.speechToTask(text)
      return response.success ? response.task : text
    } catch {
      return text
    }
  }
}

// Provider Factory Functions
export function createAIProvider(providerType: string, apiKey?: string): AIProvider {
  switch (providerType) {
    case 'openai':
      return new OpenAIProvider(apiKey || '')
    case 'claude':
      return new ClaudeProvider(apiKey || '')
    case 'gemini':
      return new GeminiProvider(apiKey || '')
    case 'ollama':
    default:
      return new OllamaProvider()
  }
}

// Enhanced AI Manager with dynamic provider switching
export class EnhancedAIManager extends AIManager {
  private userSettings?: {
    preferredAI?: string
    openaiKey?: string
    claudeKey?: string
    geminiKey?: string
  }

  constructor() {
    super(new OllamaProvider())
  }

  // Update user settings and switch provider accordingly
  updateUserSettings(settings: {
    preferredAI?: string
    openaiKey?: string
    claudeKey?: string
    geminiKey?: string
  }) {
    this.userSettings = settings
    
    if (settings.preferredAI) {
      const apiKey = this.getApiKeyForProvider(settings.preferredAI)
      const provider = createAIProvider(settings.preferredAI, apiKey)
      this.setProvider(provider)
    }
  }

  private getApiKeyForProvider(providerType: string): string | undefined {
    switch (providerType) {
      case 'openai':
        return this.userSettings?.openaiKey
      case 'claude':
        return this.userSettings?.claudeKey
      case 'gemini':
        return this.userSettings?.geminiKey
      default:
        return undefined
    }
  }

  // Load user settings from API and update provider
  async loadUserSettings(userId?: string) {
    if (!userId) return

    try {
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const settings = await response.json()
        this.updateUserSettings(settings)
      }
    } catch (error) {
      console.error('Failed to load user settings:', error)
      // Fall back to Ollama
      this.setProvider(new OllamaProvider())
    }
  }
}

// Global AI manager instance
export const aiManager = new EnhancedAIManager()

// For testing: uncomment the lines below to use test AI instead of Ollama
// import { TestAIProvider } from './test-ai'
// aiManager.setProvider(new TestAIProvider())

// Check Ollama availability
export async function checkOllamaAvailability(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', { 
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    })
    return response.ok
  } catch {
    return false
  }
}
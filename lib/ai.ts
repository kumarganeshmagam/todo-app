import { Todo } from '@/types'

export interface AIResponse {
  success: boolean
  content?: string
  error?: string
}

export interface AIProvider {
  summarize: (content: string) => Promise<AIResponse>
  rewriteAndFormat: (content: string) => Promise<AIResponse>
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

// Placeholder providers for future extension
export class OpenAIProvider implements AIProvider {
  async summarize(content: string): Promise<AIResponse> {
    return { success: false, error: 'OpenAI integration not implemented' }
  }

  async rewriteAndFormat(content: string): Promise<AIResponse> {
    return { success: false, error: 'OpenAI integration not implemented' }
  }

  async extractTasks(content: string): Promise<{ tasks: string[], success: boolean, error?: string }> {
    return { tasks: [], success: false, error: 'OpenAI integration not implemented' }
  }

  async speechToTask(text: string): Promise<{ task: string, success: boolean, error?: string }> {
    return { task: '', success: false, error: 'OpenAI integration not implemented' }
  }
}

export class ClaudeProvider implements AIProvider {
  async summarize(content: string): Promise<AIResponse> {
    return { success: false, error: 'Claude integration not implemented' }
  }

  async rewriteAndFormat(content: string): Promise<AIResponse> {
    return { success: false, error: 'Claude integration not implemented' }
  }

  async extractTasks(content: string): Promise<{ tasks: string[], success: boolean, error?: string }> {
    return { tasks: [], success: false, error: 'Claude integration not implemented' }
  }

  async speechToTask(text: string): Promise<{ task: string, success: boolean, error?: string }> {
    return { task: '', success: false, error: 'Claude integration not implemented' }
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
      return response.success ? response.content || content : this.fallbackMessage
    } catch {
      return this.fallbackMessage
    }
  }

  async rewriteAndFormatWithFallback(content: string): Promise<string> {
    try {
      const response = await this.provider.rewriteAndFormat(content)
      return response.success ? response.content || content : this.fallbackMessage
    } catch {
      return this.fallbackMessage
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

// Global AI manager instance
export const aiManager = new AIManager()
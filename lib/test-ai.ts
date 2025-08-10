import { AIProvider, AIResponse } from './ai'

// Test AI provider for development and testing
export class TestAIProvider implements AIProvider {
  async summarize(content: string): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const summary = `<p><strong>Summary:</strong> This is a test summary of the selected content. Key points have been condensed and main ideas highlighted.</p>`
    
    return { success: true, content: summary }
  }

  async rewriteAndFormat(content: string): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const rewritten = `<p>This is a <strong>rewritten and formatted</strong> version of your content. The text has been improved for <em>clarity</em> and <strong>readability</strong>.</p>
    
<p>The original content has been restructured to provide better flow and organization.</p>`
    
    return { success: true, content: rewritten }
  }

  async formatAsBlogPost(content: string): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate preserving original content while adding structure
    const blogPost = `<h2>Introduction</h2>

<p>This section transforms your original content: "<em>${content.substring(0, 100)}${content.length > 100 ? '...' : ''}</em>" into a well-structured blog format while <strong>preserving all your original ideas</strong>.</p>

<h2>Main Content Analysis</h2>

<p>Your original content has been enhanced with proper formatting while maintaining all the key information you provided.</p>

<h3>Key Points from Your Content</h3>

<ul>
  <li><strong>First main idea:</strong> Enhanced from your original text</li>
  <li><strong>Second key concept:</strong> Formatted for better readability</li>
  <li><strong>Supporting details:</strong> All preserved with better structure</li>
</ul>

<h3>Additional Structure</h3>

<p>The AI has added proper headings and organization to make your content more <em>engaging</em> and <strong>professional</strong>.</p>

<h4>Technical Implementation</h4>

<ol>
  <li>Preserve all original information</li>
  <li>Add semantic HTML structure</li>
  <li>Enhance readability with formatting</li>
  <li>Maintain the author's voice and intent</li>
</ol>

<h2>Conclusion</h2>

<p>Your content is now formatted as a professional blog post with proper headings, bullet points, and structure - exactly as requested!</p>`
    
    return { success: true, content: blogPost }
  }

  async extractTasks(content: string): Promise<{ tasks: string[], success: boolean, error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const tasks = [
      'Review the blog post draft',
      'Add relevant images to the content',
      'Optimize for SEO keywords',
      'Schedule publication date',
      'Share on social media platforms'
    ]
    
    return { tasks, success: true }
  }

  async speechToTask(text: string): Promise<{ task: string, success: boolean, error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const task = `Complete the task: ${text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}`
    
    return { task, success: true }
  }
}
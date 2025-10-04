import fs from 'fs'
import path from 'path'

export async function loadPrompt(promptFile: string): Promise<string> {
  try {
    const promptPath = path.join(process.cwd(), 'prompts', promptFile)
    const promptContent = fs.readFileSync(promptPath, 'utf-8')
    return promptContent
  } catch (error) {
    console.error(`Error loading prompt file ${promptFile}:`, error)
    throw new Error(`Failed to load prompt file: ${promptFile}`)
  }
}

export function buildPromptWithUserData(basePrompt: string, userData: Record<string, string>): string {
  let prompt = basePrompt
  
  // Replace all template variables with user data
  Object.entries(userData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    prompt = prompt.replace(new RegExp(placeholder, 'g'), value)
  })
  
  return prompt
}

export function extractJSONFromResponse(response: string): any {
  // Try to extract JSON from the response, removing any markdown or extra text
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Failed to parse JSON:', error)
      throw new Error('Invalid JSON response from AI')
    }
  }
  
  throw new Error('No valid JSON found in response')
}

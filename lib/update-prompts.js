#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const promptsDir = path.join(__dirname, '..', 'prompts')
const strictInstruction = `You MUST ONLY respond with one valid JSON object. No commentary, no Markdown, no explanations. JSON must strictly follow this schema:

If unsure, output empty arrays/strings, but do not add text outside JSON.

Actual content:`

// Get all prompt files
const files = fs.readdirSync(promptsDir).filter(file => file.endsWith('.txt'))

files.forEach(file => {
  const filePath = path.join(promptsDir, file)
  const content = fs.readFileSync(filePath, 'utf-8')
  
  // Remove the old instructions and prepend with strict instruction
  let newContent = content
  if (newContent.includes('You must ONLY respond')) {
    // Remove the existing instruction
    const lines = newContent.split('\n')
    const filteredLines = lines.filter(line => 
      !line.includes('You must ONLY respond') && 
      !line.includes('NO other text') &&
      !line.includes('Actual content:')
    )
    newContent = filteredLines.join('\n')
  }
  
  // Prepend strict instruction
  const finalContent = `${strictInstruction}
  
${newContent}`

  fs.writeFileSync(filePath, finalContent)
  console.log(`Updated ${file}`)
})

console.log('All prompts updated with strict JSON enforcement!')

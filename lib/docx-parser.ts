import mammoth from 'mammoth'

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value.trim()
}

export function truncateForContext(text: string, maxChars = 3000): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + '\n...[afgekapt]'
}

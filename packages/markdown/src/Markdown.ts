import type { Token } from 'markdown-it'
import MarkdownIt from 'markdown-it'

const markdownIt = new MarkdownIt()

// use markdownIt to parse markdown content
// into tokens
export function tokenize(content: string): Token[] {
  return markdownIt.parse(content, {})
}

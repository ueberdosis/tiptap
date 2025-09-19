/**
 * Example showing the correct contentType usage
 *
 * contentType option works in two places:
 * 1. Editor options - affects the initial 'content' option
 * 2. Command options - affects individual commands (setContent, insertContent, insertContentAt)
 */

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

// ========== EDITOR INITIALIZATION ==========

// HTML content (default for strings)
const htmlEditor = new Editor({
  extensions: [Document, Paragraph, Text],
  content: '<p>This is HTML content</p>',
  // contentType: 'html' // Optional - default for strings
})

// JSON content (default for objects)
const jsonEditor = new Editor({
  extensions: [Document, Paragraph, Text],
  content: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'This is JSON content' }],
      },
    ],
  },
  // contentType: 'json' // Optional - default for objects
})

// Markdown content (requires explicit contentType)
const markdownEditor = new Editor({
  extensions: [Document, Paragraph, Text],
  content: '# Markdown Title\n\nWith **bold** text',
  contentType: 'markdown', // Required to parse as markdown
})

// ========== COMMAND USAGE ==========

const commandsEditor = new Editor({
  extensions: [Document, Paragraph, Text],
  content: '<p>Initial content</p>', // This is parsed as HTML
})

// Each command can have its own contentType option

// 1. insertContent with different contentTypes
commandsEditor.commands.insertContent('<strong>HTML content</strong>') // Default: HTML
commandsEditor.commands.insertContent('**Markdown content**', { contentType: 'markdown' })
commandsEditor.commands.insertContent({ type: 'paragraph', content: [{ type: 'text', text: 'JSON content' }] }) // Auto-detected as JSON

// 2. setContent with different contentTypes
commandsEditor.commands.setContent('<h1>New HTML Content</h1>') // Default: HTML
commandsEditor.commands.setContent('# New Markdown Content', { contentType: 'markdown' })
commandsEditor.commands.setContent({ type: 'doc', content: [] }) // Auto-detected as JSON

// 3. insertContentAt with different contentTypes
commandsEditor.commands.insertContentAt(0, '<p>HTML at position 0</p>') // Default: HTML
commandsEditor.commands.insertContentAt(0, '## Markdown at position 0', { contentType: 'markdown' })

// ========== PRIORITY RULES ==========

// EDITOR INITIALIZATION:
// 1. If contentType is explicitly set → use that
// 2. If content is object/array → assume JSON
// 3. If content is string → assume HTML

// COMMANDS:
// 1. If contentType is explicitly set in options → use that
// 2. If content is object/array → assume JSON
// 3. If content is string → assume HTML (default for backward compatibility)

export { commandsEditor, htmlEditor, jsonEditor, markdownEditor }

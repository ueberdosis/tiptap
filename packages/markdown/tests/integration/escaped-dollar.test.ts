import { Editor } from '@tiptap/core'
import { Code } from '@tiptap/extension-code'
import { Document } from '@tiptap/extension-document'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { Markdown, MarkdownManager } from '../../src/index.js'

const collectTypes = (node: any): string[] => [
  node.type,
  ...(node.content || []).flatMap(collectTypes),
]

describe('escaped dollar signs', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Code, Mathematics],
  })

  it('keeps the backslash on \\$ so inline math is not reparsed', () => {
    const input = 'The variable \\$x\\$ is a placeholder.'
    const json = markdownManager.parse(input)

    expect(json.content?.[0].content).toEqual([
      { type: 'text', text: 'The variable $x$ is a placeholder.' },
    ])
    expect(markdownManager.serialize(json)).toBe(input)
    expect(collectTypes(markdownManager.parse(markdownManager.serialize(json)))).not.toContain(
      'inlineMath',
    )
  })

  it('keeps the backslash on \\$\\$ so block math is not reparsed', () => {
    const input = 'The variable \\$\\$x\\$\\$ is a placeholder.'
    const json = markdownManager.parse(input)

    expect(json.content?.[0].content).toEqual([
      { type: 'text', text: 'The variable $$x$$ is a placeholder.' },
    ])
    expect(markdownManager.serialize(json)).toBe(input)
    expect(collectTypes(markdownManager.parse(markdownManager.serialize(json)))).not.toContain(
      'blockMath',
    )
  })

  it('still serializes real inline and block math with unescaped dollars', () => {
    const inline = markdownManager.parse('The value $x$ is math.')
    expect(collectTypes(inline)).toContain('inlineMath')
    expect(markdownManager.serialize(inline)).toBe('The value $x$ is math.')

    const block = markdownManager.parse('$$\nx\n$$')
    expect(collectTypes(block)).toContain('blockMath')
    expect(markdownManager.serialize(block)).toBe('$$\nx\n$$')
  })

  it('does not escape a dollar inside inline code', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '$x$', marks: [{ type: 'code' }] }],
        },
      ],
    }

    expect(markdownManager.serialize(json)).toBe('`$x$`')
  })

  it('keeps the backslash from getMarkdown()', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Mathematics, Markdown],
      content: 'The variable \\$x\\$ is a placeholder.',
      contentType: 'markdown',
    })

    try {
      expect(editor.getMarkdown()).toBe('The variable \\$x\\$ is a placeholder.')
      editor.commands.setContent(editor.getMarkdown(), { contentType: 'markdown' })
      expect(editor.getJSON().content?.[0].content).toEqual([
        { type: 'text', text: 'The variable $x$ is a placeholder.' },
      ])
    } finally {
      editor.destroy()
    }
  })
})

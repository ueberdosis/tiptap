import type { Extension } from '@tiptap/core'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Blockquote Markdown Conversion', () => {
  let markdownManager: MarkdownManager

  beforeEach(() => {
    markdownManager = new MarkdownManager()
    const extensions = [Document, Paragraph, Text, Blockquote, Heading]
    extensions.forEach(extension => {
      markdownManager.registerExtension(extension as Extension)
    })
  })

  it('should convert a single-level blockquote to markdown', () => {
    const markdown = '> This is a blockquote'
    const json = markdownManager.parse(markdown)
    const output = markdownManager.serialize(json)

    expect(output.trim()).toBe(markdown)
  })

  it('should convert a single-level blockquote with multiple paragraphs to markdown', () => {
    const markdown = '> First paragraph\n>\n> Second paragraph'
    const json = markdownManager.parse(markdown)
    const output = markdownManager.serialize(json)

    expect(output.trim()).toBe(markdown)
  })

  it('should convert nested blockquotes to markdown', () => {
    const markdown = '> Level 1\n>\n> > Level 2\n> >\n> > > Level 3'
    const json = markdownManager.parse(markdown)
    const output = markdownManager.serialize(json)

    expect(output.trim()).toBe(markdown)
  })

  it('should handle blockquotes with varying nesting depths', () => {
    const markdown = '> Level 1\n>\n> > Level 2\n> >\n> > > Level 3\n> >\n> > Back to level 2\n>\n> Back to level 1'
    const json = markdownManager.parse(markdown)
    const output = markdownManager.serialize(json)

    expect(output.trim()).toBe(markdown)
  })

  it('should convert nested blockquotes with multiple paragraphs', () => {
    const markdown = '> First paragraph\n>\n> Second paragraph\n>\n> > Nested paragraph\n> >\n> > > Deeply nested'
    const json = markdownManager.parse(markdown)
    const output = markdownManager.serialize(json)

    expect(output.trim()).toBe(markdown)
  })

  it('should handle a blockquote that jumps multiple levels deep', () => {
    const markdown = '> Level 1\n>\n> > > Level 3 (jumped from 1 to 3)'
    const json = markdownManager.parse(markdown)
    const output = markdownManager.serialize(json)

    expect(output.trim()).toBe(markdown)
  })

  it('should handle blockquotes going back to shallower nesting', () => {
    const markdown = '> Level 1\n>\n> > Level 2\n> >\n> > > Level 3\n> >\n> > Back to level 2\n>\n> Back to level 1'
    const json = markdownManager.parse(markdown)
    const output = markdownManager.serialize(json)

    expect(output.trim()).toBe(markdown)
  })

  it('should handle blockquotes with text content at different levels', () => {
    const markdown = '> Outer quote with some text\n>\n> > Inner quote with more text\n> >\n> > > Innermost quote'
    const json = markdownManager.parse(markdown)
    const output = markdownManager.serialize(json)

    expect(output.trim()).toBe(markdown)
  })

  it('should handle blockquotes with mixed content including headings', () => {
    const markdown =
      '> This is a block quote\n>\n> With more paragraphs\n>\n> # And a heading\n>\n> > And nested\n> >\n> > ## And another heading'
    const json = markdownManager.parse(markdown)
    const output = markdownManager.serialize(json)

    expect(output.trim()).toBe(markdown)
  })
})

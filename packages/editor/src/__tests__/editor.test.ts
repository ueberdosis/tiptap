import { describe, expect, it } from 'vitest'

import { Editor, withDefaultCoreNodes } from '../editor.js'
import { Bold } from '../marks/bold.js'
import { Document } from '../nodes/document.js'
import { Heading } from '../nodes/heading.js'
import { Paragraph } from '../nodes/paragraph.js'
import { Text } from '../nodes/text.js'

describe('withDefaultCoreNodes', () => {
  it('prepends Document, Paragraph, and Text to an empty extensions array', () => {
    const result = withDefaultCoreNodes()
    const names = result.map(e => (e as { name: string }).name)
    expect(names).toEqual(['doc', 'paragraph', 'text'])
  })

  it('adds defaults alongside user extensions, keeping user order intact', () => {
    const result = withDefaultCoreNodes([Heading, Bold])
    const names = result.map(e => (e as { name: string }).name)
    expect(names).toEqual(['doc', 'paragraph', 'text', 'heading', 'bold'])
  })

  it('does not duplicate a default when the user supplies an extension with the same name', () => {
    const CustomParagraph = Paragraph.extend({ name: 'paragraph' })
    const result = withDefaultCoreNodes([CustomParagraph])
    const names = result.map(e => (e as { name: string }).name)
    // 'paragraph' must appear exactly once and come from the user-supplied extension
    expect(names.filter(n => n === 'paragraph')).toHaveLength(1)
    expect(result.find(e => (e as { name: string }).name === 'paragraph')).toBe(CustomParagraph)
  })

  it('lets the user fully replace all three core defaults', () => {
    const CustomDoc = Document.extend({ name: 'doc' })
    const CustomParagraph = Paragraph.extend({ name: 'paragraph' })
    const CustomText = Text.extend({ name: 'text' })
    const result = withDefaultCoreNodes([CustomDoc, CustomParagraph, CustomText])
    expect(result).toEqual([CustomDoc, CustomParagraph, CustomText])
  })
})

describe('Editor (defaults-enabled)', () => {
  it('instantiates with no options and includes Document, Paragraph, Text in the schema', () => {
    const editor = new Editor()
    try {
      expect(editor.schema.nodes.doc).toBeDefined()
      expect(editor.schema.nodes.paragraph).toBeDefined()
      expect(editor.schema.nodes.text).toBeDefined()
    } finally {
      editor.destroy()
    }
  })

  it('parses HTML content without the consumer registering core nodes explicitly', () => {
    const editor = new Editor({ content: '<p>Hello world</p>' })
    try {
      expect(editor.getText()).toBe('Hello world')
    } finally {
      editor.destroy()
    }
  })

  it('still works when the consumer provides additional extensions', () => {
    const editor = new Editor({
      extensions: [Heading, Bold],
      content: '<h1>Title</h1><p><strong>Bold</strong> text</p>',
    })
    try {
      expect(editor.schema.nodes.heading).toBeDefined()
      expect(editor.schema.marks.bold).toBeDefined()
      expect(editor.getText()).toContain('Title')
      expect(editor.getText()).toContain('Bold')
    } finally {
      editor.destroy()
    }
  })

  it('honors a user-supplied replacement for a default core node', () => {
    const CustomParagraph = Paragraph.extend({
      addAttributes() {
        return {
          variant: { default: 'body' },
        }
      },
    })

    const editor = new Editor({
      extensions: [CustomParagraph],
      content: '<p>Hello</p>',
    })
    try {
      const paragraphSpec = editor.schema.nodes.paragraph
      expect(paragraphSpec).toBeDefined()
      // The custom attribute should be present on the schema, proving the
      // user's extension replaced the default rather than being added next to it.
      expect(paragraphSpec.spec.attrs).toBeDefined()
      expect(paragraphSpec.spec.attrs?.variant).toBeDefined()
    } finally {
      editor.destroy()
    }
  })
})

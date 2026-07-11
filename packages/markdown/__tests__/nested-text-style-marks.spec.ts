import { Mark } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

import { MarkdownManager } from '../src/MarkdownManager.js'

// Adjacent text nodes sharing a mark type but differing in attributes must each
// render their own mark, instead of collapsing into one continuous run.
const TextStyle = Mark.create({
  name: 'textStyle',

  addAttributes() {
    return {
      color: { default: null },
    }
  },

  renderMarkdown: (node, helpers) => {
    const content = helpers.renderChildren(node)
    const color = node.attrs?.color
    if (!color) {
      return content
    }
    return `<span style="color: ${color}">${content}</span>`
  },
})

describe('serializing adjacent same-type marks with different attributes', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, TextStyle],
  })

  it('renders each distinct textStyle attribute set instead of collapsing them', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Test ',
              marks: [{ type: 'textStyle', attrs: { color: '#9bbb59' } }],
            },
            {
              type: 'text',
              text: 'nested',
              marks: [{ type: 'textStyle', attrs: { color: '#ff0000' } }],
            },
            {
              type: 'text',
              text: ' style',
              marks: [{ type: 'textStyle', attrs: { color: '#9bbb59' } }],
            },
          ],
        },
      ],
    }

    const result = markdownManager.serialize(json)

    // renderMarkdown must run once per distinct segment: three spans total,
    // with the middle color present (proving the nested run rendered on its own).
    const spanCount = (result.match(/<span /g) || []).length
    expect(spanCount).toBe(3)
    expect(result).toContain('color: #ff0000')
    expect(result).toContain('Test')
    expect(result).toContain('nested')
    expect(result).toContain('style')
  })
})

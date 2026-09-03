import { renderNestedMarkdownContent } from '@tiptap/core'
import { describe, expect, it } from 'vite-plus/test'

const node = {
  type: 'listItem',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'parent' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'child' }] },
  ],
}

/** Stand-in for the renderer helpers, with a configurable indent. */
const helpers = (indent: string) => ({
  renderChildren: (nodes: any[]) => nodes[0]?.content?.[0]?.text ?? '',
  renderChild: (child: any) => child?.content?.[0]?.text ?? '',
  indent: (text: string) => indent + text,
})

describe('renderNestedMarkdownContent', () => {
  it('uses the configured indent when alignment is off', () => {
    const out = renderNestedMarkdownContent(node, helpers('  '), '10. ')

    expect(out).toBe('10. parent\n\n  child')
  })

  it('widens a narrow indent to the prefix width', () => {
    const out = renderNestedMarkdownContent(node, helpers('  '), '10. ', undefined, {
      alignNestedToPrefix: true,
    })

    expect(out).toBe('10. parent\n\n    child')
  })

  it('keeps a tab, which already reaches the prefix width', () => {
    const out = renderNestedMarkdownContent(node, helpers('\t'), '10. ', undefined, {
      alignNestedToPrefix: true,
    })

    expect(out).toBe('10. parent\n\n\tchild')
  })

  it('measures a tabbed prefix in columns rather than characters', () => {
    // `\t- ` is one tab plus two characters, so it spans six columns, not three.
    const out = renderNestedMarkdownContent(node, helpers('  '), '\t- ', undefined, {
      alignNestedToPrefix: true,
    })

    expect(out).toBe('\t- parent\n\n      child')
  })
})

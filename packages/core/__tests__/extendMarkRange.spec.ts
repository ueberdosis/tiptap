import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

describe('extendMarkRange', () => {
  it('should extend full mark', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'text',
            },
            {
              type: 'text',
              text: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'foo',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: 'text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content,
      extensions: [Document, Paragraph, Text, Link],
    })

    // debug
    // console.log(getDebugJSON(editor.state.doc))

    // set cursor in middle of first mark
    editor.chain().setTextSelection({ from: 7, to: 7 }).extendMarkRange('link').run()

    const { from, to } = editor.state.selection

    const expectedSelection = {
      from: 5,
      to: 9,
    }

    expect({ from, to }).toEqual(expectedSelection)

    editor.destroy()
  })

  it('should extend to mark with specific attributes', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'text',
            },
            {
              type: 'text',
              text: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'foo',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'bar',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: 'text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content,
      extensions: [Document, Paragraph, Text, Link],
    })

    // debug
    // console.log(getDebugJSON(editor.state.doc))

    // set cursor in middle of first mark
    editor
      .chain()
      .setTextSelection({ from: 7, to: 7 })
      .extendMarkRange('link', {
        href: 'foo',
      })
      .run()

    const { from, to } = editor.state.selection

    const expectedSelection = {
      from: 5,
      to: 9,
    }

    expect({ from, to }).toEqual(expectedSelection)

    editor.destroy()
  })

  it('should not extend at all if selection contains no mark', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'text',
            },
            {
              type: 'text',
              text: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'foo',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'bar',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: 'text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content,
      extensions: [Document, Paragraph, Text, Link],
    })

    // debug
    // console.log(getDebugJSON(editor.state.doc))

    // set cursor before any mark
    editor.chain().setTextSelection({ from: 2, to: 2 }).extendMarkRange('link').run()

    const { from, to } = editor.state.selection

    const expectedSelection = {
      from: 2,
      to: 2,
    }

    expect({ from, to }).toEqual(expectedSelection)

    editor.destroy()
  })

  it('should not extend at all if selection contains any non-matching mark', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'text',
            },
            {
              type: 'text',
              text: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'foo',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'bar',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: 'text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content,
      extensions: [Document, Paragraph, Text, Link],
    })

    // debug
    // console.log(getDebugJSON(editor.state.doc))

    // set cursor before across non-matching marks
    editor
      .chain()
      .setTextSelection({ from: 7, to: 11 })
      .extendMarkRange('link', {
        href: 'foo',
      })
      .run()

    const { from, to } = editor.state.selection

    const expectedSelection = {
      from: 7,
      to: 11,
    }

    expect({ from, to }).toEqual(expectedSelection)

    editor.destroy()
  })

  it('should not extend across adjacent marks with different attributes when attributes is omitted', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'text',
            },
            {
              type: 'text',
              text: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'foo',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'bar',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: 'text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content,
      extensions: [Document, Paragraph, Text, Link],
    })

    // set cursor in middle of first link mark
    editor.chain().setTextSelection({ from: 7, to: 7 }).extendMarkRange('link').run()

    const { from, to } = editor.state.selection

    // should only extend to cover the link with href='foo', not the adjacent link with href='bar'
    const expectedSelection = {
      from: 5,
      to: 9,
    }

    expect({ from, to }).toEqual(expectedSelection)

    editor.destroy()
  })

  it('should default to attributes of the first mark of the given type', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Highlighted ',
              marks: [
                { type: 'highlight', attrs: { color: 'red' } },
                { type: 'link', attrs: { href: 'https://tiptap.dev' } },
              ],
            },
            {
              type: 'text',
              text: 'link.',
              marks: [{ type: 'link', attrs: { href: 'https://tiptap.dev' } }],
            },
            {
              type: 'text',
              text: 'another link',
              marks: [{ type: 'link', attrs: { href: 'https://tiptap.dev/invalid' } }],
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content,
      extensions: [Document, Paragraph, Text, Highlight.configure({ multicolor: true }), Link],
    })

    // set cursor inside 'Highlighted ' — should extend to cover 'Highlighted link.'
    // but not 'another link' (different href), and should not be confused by the
    // highlight mark sharing the first text node even though that is the first mark
    editor.chain().setTextSelection({ from: 5, to: 5 }).extendMarkRange('link').run()

    const { from, to } = editor.state.selection

    expect({ from, to }).toEqual({ from: 1, to: 18 })

    editor.destroy()
  })

  it('should extend across adjacent marks with different attributes when attributes is {}', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'text',
            },
            {
              type: 'text',
              text: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'foo',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'bar',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: 'text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content,
      extensions: [Document, Paragraph, Text, Link],
    })

    // set cursor in middle of first mark
    editor.chain().setTextSelection({ from: 7, to: 7 }).extendMarkRange('link', {}).run()

    const { from, to } = editor.state.selection

    // should extend to cover both links
    const expectedSelection = {
      from: 5,
      to: 13,
    }

    expect({ from, to }).toEqual(expectedSelection)

    editor.destroy()
  })
})

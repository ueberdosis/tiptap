// eslint-disable-next-line
import { Editor, getDebugJSON } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import Link from '@dibdab/extension-link'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
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
    editor.chain().setTextSelection({ from: 7, to: 7 }).extendMarkRange('link').run()

    const { from, to } = editor.state.selection

    const expectedSelection = {
      from: 5,
      to: 13,
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
})

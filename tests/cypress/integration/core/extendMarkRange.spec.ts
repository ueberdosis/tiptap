/// <reference types="cypress" />

import { Editor, getDebugJSON } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Link from '@tiptap/extension-link'

describe('extendMarkRange', () => {
  it('should extend full mark', () => {
    const content = {
      type: 'doc',
      content: [{
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
      }],
    }

    const editor = new Editor({
      content,
      extensions: [
        Document,
        Paragraph,
        Text,
        Link,
      ],
    })

    // debug
    // console.log(getDebugJSON(editor.state.doc))

    // set cursor in middle of first mark
    editor
      .chain()
      .setTextSelection({ from: 7, to: 7 })
      .extendMarkRange('link')
      .run()

    const { from, to } = editor.state.selection

    const expectedSelection = {
      from: 5,
      to: 13,
    }

    expect({ from, to }).to.deep.eq(expectedSelection)
  })

  it('should extend to mark with specific attributes', () => {
    const content = {
      type: 'doc',
      content: [{
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
      }],
    }

    const editor = new Editor({
      content,
      extensions: [
        Document,
        Paragraph,
        Text,
        Link,
      ],
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

    expect({ from, to }).to.deep.eq(expectedSelection)
  })

  it('should not extend at all if selection contains no mark', () => {
    const content = {
      type: 'doc',
      content: [{
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
      }],
    }

    const editor = new Editor({
      content,
      extensions: [
        Document,
        Paragraph,
        Text,
        Link,
      ],
    })

    // debug
    // console.log(getDebugJSON(editor.state.doc))

    // set cursor before any mark
    editor
      .chain()
      .setTextSelection({ from: 2, to: 2 })
      .extendMarkRange('link')
      .run()

    const { from, to } = editor.state.selection

    const expectedSelection = {
      from: 2,
      to: 2,
    }

    expect({ from, to }).to.deep.eq(expectedSelection)
  })

  it('should not extend at all if selection contains any non-matching mark', () => {
    const content = {
      type: 'doc',
      content: [{
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
      }],
    }

    const editor = new Editor({
      content,
      extensions: [
        Document,
        Paragraph,
        Text,
        Link,
      ],
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

    expect({ from, to }).to.deep.eq(expectedSelection)
  })
})

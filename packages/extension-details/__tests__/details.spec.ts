import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { Details, DetailsContent, DetailsSummary } from '../src/index.js'

describe('Details', () => {
  let editor: Editor
  let editorElement: HTMLDivElement | undefined

  afterEach(() => {
    editor?.destroy()
    editorElement?.remove()
    editorElement = undefined
  })

  it('adds a default aria-label to the toggle button', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Details, DetailsSummary, DetailsContent],
      content: {
        type: 'doc',
        content: [
          {
            type: 'details',
            content: [
              {
                type: 'detailsSummary',
                content: [{ type: 'text', text: 'Summary' }],
              },
              {
                type: 'detailsContent',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Content' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    const toggleButton = editor.view.dom.querySelector('div[data-type="details"] > button')

    expect(toggleButton?.getAttribute('aria-label')).toBe('Expand details content')
  })

  it('supports custom toggle button rendering and updates it when the node open state changes', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Details.configure({
          persist: true,
          renderToggleButton: ({ element, isOpen, node }) => {
            element.setAttribute(
              'aria-label',
              `${isOpen ? 'Collapse' : 'Expand'} ${node.textContent || 'details content'}`,
            )
          },
        }),
        DetailsSummary,
        DetailsContent,
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'details',
            attrs: {
              open: false,
            },
            content: [
              {
                type: 'detailsSummary',
                content: [{ type: 'text', text: 'Summary' }],
              },
              {
                type: 'detailsContent',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Content' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    const getToggleButton = () => editor.view.dom.querySelector('div[data-type="details"] > button')

    expect(getToggleButton()?.getAttribute('aria-label')).toBe('Expand SummaryContent')

    editor.commands.updateAttributes('details', { open: true })

    expect(getToggleButton()?.getAttribute('aria-label')).toBe('Collapse SummaryContent')
  })

  it('updates a persisted details node at the start of the document when toggled', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Details.configure({ persist: true }),
        DetailsSummary,
        DetailsContent,
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'details',
            attrs: {
              open: true,
            },
            content: [
              {
                type: 'detailsSummary',
                content: [{ type: 'text', text: 'Summary' }],
              },
              {
                type: 'detailsContent',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Content' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    const toggleButton = editor.view.dom.querySelector<HTMLButtonElement>(
      'div[data-type="details"] > button',
    )

    toggleButton?.click()

    expect(editor.state.doc.firstChild?.attrs.open).toBe(false)
    expect(editor.getHTML()).toBe(
      '<details><summary>Summary</summary><div data-type="detailsContent"><p>Content</p></div></details>',
    )
  })

  it('keeps the cursor in details content after typing at the start of the document', () => {
    editorElement = document.createElement('div')
    document.body.appendChild(editorElement)

    editor = new Editor({
      element: editorElement,
      extensions: [Document, Paragraph, Text, Details, DetailsSummary, DetailsContent],
      content: {
        type: 'doc',
        content: [
          {
            type: 'details',
            content: [
              {
                type: 'detailsSummary',
                content: [{ type: 'text', text: 'Summary' }],
              },
              {
                type: 'detailsContent',
                content: [{ type: 'paragraph' }],
              },
            ],
          },
        ],
      },
    })

    Object.defineProperty(editor.view.dom, 'offsetParent', { value: document.body })
    const paragraph = editor.view.dom.querySelector('p')

    if (!paragraph) {
      throw new Error('Expected details content to contain a paragraph')
    }

    Object.defineProperty(paragraph, 'offsetParent', {
      value: editor.view.dom,
    })

    const toggleButton = editor.view.dom.querySelector<HTMLButtonElement>(
      'div[data-type="details"] > button',
    )
    const summary = editor.state.doc.firstChild?.firstChild
    const contentPosition = 1 + (summary?.nodeSize ?? 0) + 2

    toggleButton?.click()
    editor.commands.setTextSelection(contentPosition)
    editor.commands.insertContent('a')
    editor.commands.setTextSelection(contentPosition + 1)

    expect(editor.state.selection.$from.parent.type).toBe(editor.schema.nodes.paragraph)
    expect(editor.state.doc.textContent).toBe('Summarya')
  })

  it('ignores button attribute mutations triggered by renderToggleButton', async () => {
    let renderToggleButtonCallCount = 0

    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Details.configure({
          renderToggleButton: ({ element, isOpen }) => {
            renderToggleButtonCallCount += 1
            element.setAttribute(
              'aria-label',
              isOpen ? 'Collapse details content' : 'Expand details content',
            )
          },
        }),
        DetailsSummary,
        DetailsContent,
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'details',
            content: [
              {
                type: 'detailsSummary',
                content: [{ type: 'text', text: 'Summary' }],
              },
              {
                type: 'detailsContent',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Content' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    await new Promise<void>(resolve => {
      setTimeout(resolve, 0)
    })

    expect(renderToggleButtonCallCount).toBe(1)
  })
})

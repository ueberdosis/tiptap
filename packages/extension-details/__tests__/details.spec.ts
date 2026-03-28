import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { Details, DetailsContent, DetailsSummary } from '../src/index.js'

describe('Details', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
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
})

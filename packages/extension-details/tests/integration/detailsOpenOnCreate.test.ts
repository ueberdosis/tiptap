import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'

const waitForNodeViewTimer = () => new Promise(resolve => setTimeout(resolve))

describe('Details created open', () => {
  let editor: Editor

  const expectOpenOnScreen = () => {
    const details = editor.view.dom.querySelector('[data-type="details"]')
    const content = details?.querySelector('[data-type="detailsContent"]')

    expect(details?.classList.contains('is-open')).toBe(true)
    expect(content?.hasAttribute('hidden')).toBe(false)
  }

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
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
            attrs: { open: true },
            content: [
              { type: 'detailsSummary', content: [{ type: 'text', text: 'Summary' }] },
              { type: 'detailsContent', content: [{ type: 'paragraph' }] },
            ],
          },
        ],
      },
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('shows open', async () => {
    await waitForNodeViewTimer()

    expectOpenOnScreen()
  })

  it('stays open when its node view updates before the first timer', async () => {
    editor.commands.insertContentAt(2, 'x')
    await waitForNodeViewTimer()

    expect(editor.getJSON().content?.[0]?.attrs?.open).toBe(true)
    expectOpenOnScreen()
  })
})

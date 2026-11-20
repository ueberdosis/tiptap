import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'

const waitForNodeViewTimer = () => new Promise(resolve => setTimeout(resolve))

const openDoc = {
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
}

const createEditor = (openWithoutDelay: boolean) => {
  const element = document.createElement('div')
  document.body.appendChild(element)

  return new Editor({
    element,
    extensions: [
      Document,
      Paragraph,
      Text,
      Details.configure({ persist: true, openWithoutDelay }),
      DetailsSummary,
      DetailsContent,
    ],
    content: openDoc,
  })
}

describe('Details created open', () => {
  let editor: Editor

  const expectOpenOnScreen = () => {
    const details = editor.view.dom.querySelector('[data-type="details"]')
    const content = details?.querySelector('[data-type="detailsContent"]')

    expect(details?.classList.contains('is-open')).toBe(true)
    expect(content?.hasAttribute('hidden')).toBe(false)
  }

  beforeEach(() => {
    editor = createEditor(false)
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

  it('is still closed right after the node views are created', () => {
    const details = editor.view.dom.querySelector('[data-type="details"]')
    const content = details?.querySelector('[data-type="detailsContent"]')

    expect(details?.classList.contains('is-open')).toBe(false)
    expect(content?.hasAttribute('hidden')).toBe(true)
  })
})

describe('Details created open with openWithoutDelay', () => {
  let editor: Editor

  const expectOpenOnScreen = () => {
    const details = editor.view.dom.querySelector('[data-type="details"]')
    const content = details?.querySelector('[data-type="detailsContent"]')

    expect(details?.classList.contains('is-open')).toBe(true)
    expect(content?.hasAttribute('hidden')).toBe(false)
  }

  beforeEach(() => {
    editor = createEditor(true)
  })

  afterEach(() => {
    editor.destroy()
  })

  it('shows open right after the node views are created, before any timer', () => {
    expectOpenOnScreen()
  })

  it('still toggles by click', async () => {
    const toggle = editor.view.dom.querySelector<HTMLButtonElement>(
      '[data-type="details"] > button',
    )

    toggle?.click()
    const details = editor.view.dom.querySelector('[data-type="details"]')
    const content = details?.querySelector('[data-type="detailsContent"]')

    expect(details?.classList.contains('is-open')).toBe(false)
    expect(content?.hasAttribute('hidden')).toBe(true)

    toggle?.click()

    expectOpenOnScreen()

    await waitForNodeViewTimer()

    expectOpenOnScreen()
  })
})

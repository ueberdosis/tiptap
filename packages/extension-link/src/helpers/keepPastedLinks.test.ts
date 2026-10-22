import { Editor, PasteRule } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { keepPastedLinks } from './keepPastedLinks.js'

describe('keepPastedLinks', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
    vi.restoreAllMocks()
  })

  // "LICENSE.md" sits at positions 1 to 11, inside a link to the docs.
  const linkedRange = { from: 1, to: 11 }

  const setup = () => {
    editor = new Editor({
      extensions: [Document, Text, Paragraph, Link],
      content: '<p><a href="https://tiptap.dev/docs">LICENSE.md</a></p>',
    })

    const inner = vi.fn()
    const rule = keepPastedLinks(
      new PasteRule({ find: /LICENSE\.md/g, handler: inner }),
      editor.schema.marks.link,
    )

    return { inner, rule }
  }

  const transfer = (html: string) => {
    const data = new DataTransfer()

    data.setData('text/html', html)

    return data
  }

  const run = (
    rule: PasteRule,
    events: { pasteEvent?: ClipboardEvent | null; dropEvent?: DragEvent | null },
  ) =>
    rule.handler({
      state: editor!.state,
      range: linkedRange,
      match: Object.assign(['LICENSE.md'], { index: 0, input: 'LICENSE.md' }),
      pasteEvent: events.pasteEvent ?? null,
      dropEvent: events.dropEvent ?? null,
    } as never)

  it('leaves a link alone when it was dropped as HTML', () => {
    const { inner, rule } = setup()
    const dropEvent = {
      dataTransfer: transfer('<a href="https://tiptap.dev/docs">LICENSE.md</a>'),
    } as unknown as DragEvent

    run(rule, { dropEvent })

    expect(inner).not.toHaveBeenCalled()
  })

  it('runs the rule for a drop without an HTML link', () => {
    const { inner, rule } = setup()
    const dropEvent = { dataTransfer: transfer('<p>LICENSE.md</p>') } as unknown as DragEvent

    run(rule, { dropEvent })

    expect(inner).toHaveBeenCalledOnce()
  })

  it('parses the clipboard HTML once per paste, not once per match', () => {
    const { inner, rule } = setup()
    const parse = vi.spyOn(DOMParser.prototype, 'parseFromString')
    const pasteEvent = {
      clipboardData: transfer('<a href="https://tiptap.dev/docs">LICENSE.md</a>'),
    } as unknown as ClipboardEvent

    for (let i = 0; i < 5; i += 1) {
      run(rule, { pasteEvent })
    }

    expect(parse).toHaveBeenCalledOnce()
    expect(inner).not.toHaveBeenCalled()
  })

  it('parses each paste separately', () => {
    const { rule } = setup()
    const parse = vi.spyOn(DOMParser.prototype, 'parseFromString')
    const html = '<a href="https://tiptap.dev/docs">LICENSE.md</a>'

    run(rule, { pasteEvent: { clipboardData: transfer(html) } as unknown as ClipboardEvent })
    run(rule, { pasteEvent: { clipboardData: transfer(html) } as unknown as ClipboardEvent })

    expect(parse).toHaveBeenCalledTimes(2)
  })
})

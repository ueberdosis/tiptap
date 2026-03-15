import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { Plugin } from '@tiptap/pm/state'
import { ySyncPluginKey } from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as Y from 'yjs'

import Collaboration from '../src/index.js'

describe('filterInvalidContent', () => {
  let editor: Editor | null = null
  let el: HTMLElement | null = null

  afterEach(() => {
    editor?.destroy()
    el?.remove()
    editor = null
    el = null
  })

  const createCollabEditor = async (
    opts: {
      onContentError?: (args: { disableCollaboration: () => void }) => void
    } = {},
  ) => {
    const ydoc = new Y.Doc()

    el = document.createElement('div')
    document.body.appendChild(el)

    editor = new Editor({
      element: el,
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
      enableContentCheck: true,
      onContentError: opts.onContentError ?? (() => {}),
    })

    await new Promise<void>(resolve => {
      setTimeout(resolve, 10)
    })

    return { editor, el, ydoc }
  }

  const findFilterPlugin = (e: Editor): Plugin | undefined =>
    e.state.plugins.find(p => p.spec.filterTransaction && p.key.includes('filterInvalidContent'))

  it('rejects Yjs transactions that produce invalid content', async () => {
    let contentErrorCalled = false

    const { editor: ed } = await createCollabEditor({
      onContentError: () => {
        contentErrorCalled = true
      },
    })

    const plugin = findFilterPlugin(ed)

    expect(plugin).toBeDefined()

    const tr = ed.state.tr.insertText('x', 1)

    tr.setMeta(ySyncPluginKey, { binding: true })

    vi.spyOn(tr.doc, 'check').mockImplementation(() => {
      throw new RangeError('Invalid content for node doc')
    })

    const result = plugin!.spec.filterTransaction!(tr, ed.state)

    expect(result).toBe(false)
    expect(contentErrorCalled).toBe(true)
    expect(ed.storage.collaboration.isDisabled).toBe(true)
  })

  it('allows local (non-Yjs) transactions through', async () => {
    const { editor: ed } = await createCollabEditor({
      onContentError: () => {
        throw new Error('contentError should not fire for local transactions')
      },
    })

    ed.commands.insertContent('hello')
    expect(ed.getText()).toContain('hello')
  })

  it('blocks Yjs transactions when isDisabled is true', async () => {
    const { editor: ed } = await createCollabEditor()

    ed.storage.collaboration.isDisabled = true

    const docBefore = ed.state.doc.toJSON()

    const tr = ed.state.tr.insertText('injected', 1)

    tr.setMeta(ySyncPluginKey, { binding: true })
    ed.view.dispatch(tr)

    expect(ed.state.doc.toJSON()).toEqual(docBefore)
  })

  it('allows Yjs transactions that do not change the doc', async () => {
    const { editor: ed } = await createCollabEditor({
      onContentError: () => {
        throw new Error('contentError should not fire for metadata-only transactions')
      },
    })

    const plugin = findFilterPlugin(ed)

    expect(plugin).toBeDefined()

    const tr = ed.state.tr

    tr.setMeta(ySyncPluginKey, { binding: true })

    expect(tr.docChanged).toBe(false)

    const result = plugin!.spec.filterTransaction!(tr, ed.state)

    expect(result).toBe(true)
  })

  it('emits contentError with disableCollaboration callback', async () => {
    let disableCollab: (() => void) | null = null

    const { editor: ed, ydoc } = await createCollabEditor({
      onContentError: args => {
        disableCollab = args.disableCollaboration
      },
    })

    const plugin = findFilterPlugin(ed)

    expect(plugin).toBeDefined()

    const tr = ed.state.tr.insertText('x', 1)

    tr.setMeta(ySyncPluginKey, { binding: true })
    vi.spyOn(tr.doc, 'check').mockImplementation(() => {
      throw new RangeError('Invalid content')
    })

    plugin!.spec.filterTransaction!(tr, ed.state)

    expect(disableCollab).not.toBeNull()

    const destroySpy = vi.spyOn(ydoc, 'destroy')

    disableCollab!()
    expect(destroySpy).toHaveBeenCalled()
  })
})

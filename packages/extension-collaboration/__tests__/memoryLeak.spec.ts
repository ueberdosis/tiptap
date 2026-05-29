import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'
import * as Y from 'yjs'

import Collaboration from '../src/index.js'

/**
 * Regression test for the memory leak where destroying an editor while the
 * Y.Doc/provider lives on (e.g. several editors sharing one provider) left the
 * editor reachable.
 *
 * Root cause: Yjs' UndoManager registers a `doc.on('destroy', ...)` listener in
 * its constructor that `UndoManager.destroy()` never removes. The long-lived doc
 * then keeps the UndoManager — and through it the whole editor — alive.
 *
 * The extension now removes that listener on destroy. We assert the doc's
 * 'destroy' listener count returns to its pre-creation baseline, which is a
 * deterministic proxy for the listener no longer pinning the editor.
 */
describe('extension-collaboration memory leak', () => {
  let editor: Editor | null = null
  let el: HTMLElement | null = null

  afterEach(() => {
    editor?.destroy()
    el?.remove()
    editor = null
    el = null
  })

  const docDestroyListenerCount = (ydoc: Y.Doc) => {
    // lib0 ObservableV2 stores listeners in a Map<eventName, Set<fn>>
    // oxlint-disable-next-line no-underscore-dangle
    const observers = (ydoc as any)._observers?.get('destroy') as Set<unknown> | undefined
    return observers ? observers.size : 0
  }

  it("removes the UndoManager's doc 'destroy' listener when the editor is destroyed", () => {
    const ydoc = new Y.Doc()
    const baseline = docDestroyListenerCount(ydoc)

    el = document.createElement('div')
    document.body.appendChild(el)

    editor = new Editor({
      element: el,
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
    })

    // An edit populates the undo stack, mirroring real usage.
    editor.commands.insertContent('<p>hello world</p>')

    // The UndoManager added its listener during construction.
    expect(docDestroyListenerCount(ydoc)).toBeGreaterThan(baseline)

    editor.destroy()
    editor = null

    // After destroy, the doc is back to its baseline — the listener that pinned
    // the editor to the long-lived doc is gone.
    expect(docDestroyListenerCount(ydoc)).toBe(baseline)
  })

  it('does not accumulate doc listeners across many editor lifecycles on a shared doc', () => {
    const ydoc = new Y.Doc()
    const baseline = docDestroyListenerCount(ydoc)

    for (let i = 0; i < 10; i += 1) {
      const element = document.createElement('div')
      document.body.appendChild(element)

      const instance = new Editor({
        element,
        extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
      })
      instance.commands.insertContent(`<p>edit ${i}</p>`)
      instance.destroy()
      element.remove()
    }

    expect(docDestroyListenerCount(ydoc)).toBe(baseline)
  })
})

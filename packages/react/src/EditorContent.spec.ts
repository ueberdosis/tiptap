import { render } from '@testing-library/react'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createContentComponent, EditorContent } from './EditorContent.js'
import type { ReactRenderer } from './ReactRenderer.js'

const createRenderer = (id: string) =>
  ({
    reactElement: React.createElement('span', null, id),
    element: document.createElement('div'),
  }) as ReactRenderer

describe('createContentComponent', () => {
  it('batches synchronous renderer change notifications', async () => {
    const contentComponent = createContentComponent()
    const subscriber = vi.fn()

    contentComponent.subscribe(subscriber)

    contentComponent.setRenderer('first', createRenderer('first'))
    contentComponent.setRenderer('second', createRenderer('second'))

    expect(Object.keys(contentComponent.getSnapshot())).toEqual(['first', 'second'])
    expect(subscriber).not.toHaveBeenCalled()

    await Promise.resolve()

    expect(subscriber).toHaveBeenCalledTimes(1)

    contentComponent.removeRenderer('first')
    contentComponent.removeRenderer('second')

    expect(Object.keys(contentComponent.getSnapshot())).toEqual([])

    await Promise.resolve()

    expect(subscriber).toHaveBeenCalledTimes(2)
  })
})

describe('EditorContent', () => {
  const mountedElements: HTMLElement[] = []

  afterEach(() => {
    mountedElements.forEach(element => element.remove())
    mountedElements.length = 0
  })

  /**
   * Renders an `EditorContent` for the given editor inside a fresh shadow root
   * attached to `document.body`, and returns the render result plus the shadow root.
   */
  function mountEditorContentInShadowRoot(editor: Editor) {
    const host = document.createElement('div')

    document.body.appendChild(host)
    mountedElements.push(host)

    const shadowRoot = host.attachShadow({ mode: 'open' })
    const container = document.createElement('div')

    shadowRoot.appendChild(container)

    const view = render(React.createElement(EditorContent, { editor }), { container })

    return { view, shadowRoot }
  }

  it('re-resolves the ProseMirror root when remounted into another shadow tree', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello World</p>',
    })

    try {
      const first = mountEditorContentInShadowRoot(editor)

      // Populate ProseMirror's lazy root cache, like any selection work would.
      expect(editor.view.root).toBe(first.shadowRoot)

      first.view.unmount()

      const second = mountEditorContentInShadowRoot(editor)

      expect(editor.view.dom.getRootNode()).toBe(second.shadowRoot)
      // A stale root breaks all selection handling: the cursor no longer
      // follows clicks because ProseMirror consults the discarded shadow root.
      expect(editor.view.root).toBe(second.shadowRoot)

      second.view.unmount()
    } finally {
      editor.destroy()
    }
  })
})

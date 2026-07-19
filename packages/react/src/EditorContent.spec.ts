import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EditorContent, createContentComponent } from './EditorContent.js'
import type { ReactRenderer } from './ReactRenderer.js'
import { useEditor } from './useEditor.js'

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

function flushTimers(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms)
  })
}

describe('EditorContent', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('mounts a real editor view into the DOM', async () => {
    function TestComponent() {
      const editor = useEditor({
        extensions: [Document, Text, Paragraph],
        content: '<p>hello</p>',
      })
      return React.createElement(EditorContent, { editor })
    }

    render(React.createElement(TestComponent))
    await flushTimers(50)

    const tiptapElements = document.querySelectorAll('.tiptap')

    expect(tiptapElements.length).toBe(1)
    expect(tiptapElements[0].textContent).toBe('hello')
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'

import { Editor } from './Editor.js'
import { PureEditorContent } from './EditorContent.js'

function createEditor() {
  const editor = Object.create(Editor.prototype) as Editor
  const dom = document.createElement('div')
  const parent = document.createElement('div')

  parent.append(dom)

  editor.contentComponent = null
  editor.isEditorContentInitialized = false

  Object.defineProperty(editor, 'view', {
    configurable: true,
    value: {
      dom,
      setProps: vi.fn(),
    },
  })

  Object.defineProperty(editor, 'setOptions', {
    configurable: true,
    value: vi.fn(),
  })

  Object.defineProperty(editor, 'createNodeViews', {
    configurable: true,
    value: vi.fn(),
  })

  Object.defineProperty(editor, 'isDestroyed', {
    configurable: true,
    value: false,
  })

  return editor
}

describe('EditorContent batching', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('flushes portal subscribers once after a transaction batch', () => {
    const editor = createEditor()
    const component = new PureEditorContent({ editor: editor as never })

    component.editorContentRef.current = document.createElement('div')
    Object.defineProperty(component, 'forceUpdate', {
      configurable: true,
      value: vi.fn(),
    })

    component.init()

    expect(editor.createNodeViews).toHaveBeenCalledTimes(1)
    expect(editor.isEditorContentInitialized).toBe(true)
    expect(editor.contentComponent).not.toBeNull()

    const subscriber = vi.fn()
    const contentComponent = editor.contentComponent!

    contentComponent.subscribe(subscriber)

    contentComponent.beginTransactionRenderBatch()
    contentComponent.setRenderer('a', {
      element: document.createElement('div'),
      reactElement: null,
    } as never)
    contentComponent.setRenderer('b', {
      element: document.createElement('div'),
      reactElement: null,
    } as never)
    contentComponent.removeRenderer('a')

    expect(subscriber).not.toHaveBeenCalled()
    expect(Object.keys(contentComponent.getSnapshot())).toEqual(['b'])

    contentComponent.endTransactionRenderBatch()

    expect(subscriber).toHaveBeenCalledTimes(1)
    expect(Object.keys(contentComponent.getSnapshot())).toEqual(['b'])
  })
})

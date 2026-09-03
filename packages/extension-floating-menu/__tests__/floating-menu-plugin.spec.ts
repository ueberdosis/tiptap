import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { PluginKey } from '@tiptap/pm/state'
import { describe, expect, it, vi } from 'vite-plus/test'

import { FloatingMenu } from '../src/floating-menu.js'
import { FloatingMenuView } from '../src/floating-menu-plugin.js'

function createEditor(content = '<p>Hello world</p>') {
  return new Editor({
    extensions: [Document, Paragraph, Text],
    content,
  })
}

function createFloatingMenuView(
  editor: Editor,
  overrides: Partial<ConstructorParameters<typeof FloatingMenuView>[0]> = {},
) {
  return new FloatingMenuView({
    editor,
    element: document.createElement('div'),
    view: editor.view,
    shouldShow: () => false,
    ...overrides,
  })
}

describe('FloatingMenuView cross-contamination', () => {
  it('should only process updateOptions for its own pluginKey (string)', () => {
    const editor = createEditor()

    const view1 = createFloatingMenuView(editor, { pluginKey: 'floatingMenu1' })
    const view2 = createFloatingMenuView(editor, { pluginKey: 'floatingMenu2' })

    const spy1 = vi.spyOn(view1, 'updateOptions')
    const spy2 = vi.spyOn(view2, 'updateOptions')

    const newOptions = { updateDelay: 999 }

    editor.view.dispatch(
      editor.state.tr.setMeta('floatingMenu1', {
        type: 'updateOptions',
        options: newOptions,
      }),
    )

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy1).toHaveBeenCalledWith(newOptions)
    expect(spy2).not.toHaveBeenCalled()

    view1.destroy()
    view2.destroy()
    editor.destroy()
  })
  it('should only process updateOptions for its own pluginKey (PluginKey instance)', () => {
    const editor = createEditor()

    const key1 = new PluginKey('customFloatingA')
    const key2 = new PluginKey('customFloatingB')

    const view1 = createFloatingMenuView(editor, { pluginKey: key1 })
    const view2 = createFloatingMenuView(editor, { pluginKey: key2 })

    const spy1 = vi.spyOn(view1, 'updateOptions')
    const spy2 = vi.spyOn(view2, 'updateOptions')

    const newOptions = { updateDelay: 500 }

    editor.view.dispatch(
      editor.state.tr.setMeta('customFloatingA$', {
        type: 'updateOptions',
        options: newOptions,
      }),
    )

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy1).toHaveBeenCalledWith(newOptions)
    expect(spy2).not.toHaveBeenCalled()

    view1.destroy()
    view2.destroy()
    editor.destroy()
  })
  it('should only process updatePosition for its own pluginKey', () => {
    const editor = createEditor()

    const view1 = createFloatingMenuView(editor, { pluginKey: 'floatingMenu1' })
    const view2 = createFloatingMenuView(editor, { pluginKey: 'floatingMenu2' })

    const spy1 = vi.spyOn(view1, 'updatePosition')
    const spy2 = vi.spyOn(view2, 'updatePosition')

    editor.view.dispatch(editor.state.tr.setMeta('floatingMenu1', 'updatePosition'))

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).not.toHaveBeenCalled()

    view1.destroy()
    view2.destroy()
    editor.destroy()
  })
  it('should not cross-contaminate options between two instances', () => {
    const editor = createEditor()

    const view1 = createFloatingMenuView(editor, {
      pluginKey: 'floatingMenu1',
      updateDelay: 100,
    })
    const view2 = createFloatingMenuView(editor, {
      pluginKey: 'floatingMenu2',
      updateDelay: 200,
    })

    editor.view.dispatch(
      editor.state.tr.setMeta('floatingMenu1', {
        type: 'updateOptions',
        options: { updateDelay: 999 },
      }),
    )

    expect(view1.updateDelay).toBe(999)
    expect(view2.updateDelay).toBe(200)

    editor.view.dispatch(
      editor.state.tr.setMeta('floatingMenu2', {
        type: 'updateOptions',
        options: { updateDelay: 777 },
      }),
    )

    expect(view1.updateDelay).toBe(999)
    expect(view2.updateDelay).toBe(777)

    view1.destroy()
    view2.destroy()
    editor.destroy()
  })
  it('should use pluginKey in updateFloatingMenuPosition command', () => {
    const customPluginKey = 'myFloatingMenu'
    const menuElement = document.createElement('div')

    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        FloatingMenu.configure({
          element: menuElement,
          pluginKey: customPluginKey,
          shouldShow: () => false,
        }),
      ],
      content: '<p>Hello world</p>',
    })

    const dispatchSpy = vi.spyOn(editor.view, 'dispatch')

    editor.commands.updateFloatingMenuPosition()

    const dispatchedTr = dispatchSpy.mock.calls[0][0]

    expect(dispatchedTr.getMeta(customPluginKey)).toBe('updatePosition')
    expect(dispatchedTr.getMeta('floatingMenu')).toBeUndefined()

    editor.destroy()
  })
  it('should maintain backward compatibility with default "floatingMenu" pluginKey', () => {
    const editor = createEditor()

    const view = createFloatingMenuView(editor)

    const spy = vi.spyOn(view, 'updateOptions')
    const newOptions = { updateDelay: 500 }

    editor.view.dispatch(
      editor.state.tr.setMeta('floatingMenu', {
        type: 'updateOptions',
        options: newOptions,
      }),
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(newOptions)

    view.destroy()
    editor.destroy()
  })
  it('should only process show for its own pluginKey', () => {
    const editor = createEditor()

    const view1 = createFloatingMenuView(editor, { pluginKey: 'floatingMenu1' })
    const view2 = createFloatingMenuView(editor, { pluginKey: 'floatingMenu2' })

    const spy1 = vi.spyOn(view1, 'show')
    const spy2 = vi.spyOn(view2, 'show')

    editor.view.dispatch(editor.state.tr.setMeta('floatingMenu1', 'show'))

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).not.toHaveBeenCalled()

    view1.destroy()
    view2.destroy()
    editor.destroy()
  })
  it('should only process hide for its own pluginKey', () => {
    const editor = createEditor()

    const view1 = createFloatingMenuView(editor, { pluginKey: 'floatingMenu1' })
    const view2 = createFloatingMenuView(editor, { pluginKey: 'floatingMenu2' })

    const spy1 = vi.spyOn(view1, 'hide')
    const spy2 = vi.spyOn(view2, 'hide')

    editor.view.dispatch(editor.state.tr.setMeta('floatingMenu1', 'hide'))

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).not.toHaveBeenCalled()

    view1.destroy()
    view2.destroy()
    editor.destroy()
  })
})

describe('FloatingMenuView destroy safety', () => {
  it('updatePosition should not call coordsAtPos when the editor view is detached from the DOM', () => {
    const editor = createEditor()
    const view = createFloatingMenuView(editor)
    const coordsSpy = vi.spyOn(editor.view, 'coordsAtPos')

    try {
      // Simulate the real-world teardown race: the editor is destroyed while a
      // pending updatePosition call (debounced resize/scroll) is still in flight.
      // ProseMirror's destroy removes view.dom from its parent and nulls docView;
      // without a guard, posToDOMRect -> coordsAtPos throws on the null docView.
      editor.destroy()

      expect(() => view.updatePosition()).not.toThrow(
        /Cannot read properties of null \(reading 'domFromPos'\)/,
      )
      expect(coordsSpy).not.toHaveBeenCalled()
    } finally {
      view.destroy()
    }
  })
})

describe('FloatingMenuView IME composition', () => {
  it('hides the menu once the composition ends', async () => {
    const editor = createEditor('<p></p>')
    const shouldShow = vi.fn(() => true)
    const onHide = vi.fn()
    const view = createFloatingMenuView(editor, { shouldShow, options: { onHide } })

    view.show()

    const oldState = editor.state

    // Text is inserted while composing is still true.
    editor.view.dispatch(editor.state.tr.insertText('\uAC00'))
    const composing = vi.spyOn(editor.view, 'composing', 'get').mockReturnValue(true)

    shouldShow.mockClear()
    view.update(editor.view, oldState)
    expect(shouldShow).not.toHaveBeenCalled()
    expect(onHide).not.toHaveBeenCalled()

    // The composition flush brings no further change, so only compositionend can trigger it.
    shouldShow.mockReturnValue(false)
    composing.mockReturnValue(false)
    editor.view.dom.dispatchEvent(new Event('compositionend'))
    await new Promise(resolve => {
      setTimeout(resolve)
    })

    expect(shouldShow).toHaveBeenCalled()
    expect(onHide).toHaveBeenCalled()

    composing.mockRestore()
    view.destroy()
    editor.destroy()
  })

  it('removes the compositionend listener on destroy', async () => {
    const editor = createEditor('<p></p>')
    const shouldShow = vi.fn(() => false)
    const view = createFloatingMenuView(editor, { shouldShow })

    view.destroy()
    shouldShow.mockClear()

    editor.view.dom.dispatchEvent(new Event('compositionend'))
    await new Promise(resolve => {
      setTimeout(resolve)
    })

    expect(shouldShow).not.toHaveBeenCalled()

    editor.destroy()
  })

  it('cancels a pending update when the view is destroyed while the editor lives on', async () => {
    const editor = createEditor('<p></p>')
    const shouldShow = vi.fn(() => false)
    const view = createFloatingMenuView(editor, { shouldShow })

    editor.view.dom.dispatchEvent(new Event('compositionend'))
    shouldShow.mockClear()
    view.destroy()

    await new Promise(resolve => {
      setTimeout(resolve)
    })

    expect(editor.isDestroyed).toBe(false)
    expect(shouldShow).not.toHaveBeenCalled()

    editor.destroy()
  })
})

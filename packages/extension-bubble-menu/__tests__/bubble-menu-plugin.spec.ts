import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { PluginKey } from '@tiptap/pm/state'
import { describe, expect, it, vi } from 'vitest'

import { BubbleMenuView } from '../src/bubble-menu-plugin.js'

function createEditor(content = '<p>Hello world</p>') {
  return new Editor({
    extensions: [Document, Paragraph, Text],
    content,
  })
}

function createBubbleMenuView(
  editor: Editor,
  overrides: Partial<ConstructorParameters<typeof BubbleMenuView>[0]> = {},
) {
  return new BubbleMenuView({
    editor,
    element: document.createElement('div'),
    view: editor.view,
    shouldShow: () => false,
    ...overrides,
  })
}

describe('BubbleMenuView cross-contamination', () => {
  it('should only process updateOptions for its own pluginKey (string)', () => {
    const editor = createEditor()

    const view1 = createBubbleMenuView(editor, { pluginKey: 'bubbleMenu1' })
    const view2 = createBubbleMenuView(editor, { pluginKey: 'bubbleMenu2' })

    const spy1 = vi.spyOn(view1, 'updateOptions')
    const spy2 = vi.spyOn(view2, 'updateOptions')

    const newOptions = { updateDelay: 999 }

    editor.view.dispatch(
      editor.state.tr.setMeta('bubbleMenu1', {
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

    const key1 = new PluginKey('customBubbleA')
    const key2 = new PluginKey('customBubbleB')

    const view1 = createBubbleMenuView(editor, { pluginKey: key1 })
    const view2 = createBubbleMenuView(editor, { pluginKey: key2 })

    const spy1 = vi.spyOn(view1, 'updateOptions')
    const spy2 = vi.spyOn(view2, 'updateOptions')

    const newOptions = { updateDelay: 500 }

    editor.view.dispatch(
      editor.state.tr.setMeta('customBubbleA$', {
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

    const view1 = createBubbleMenuView(editor, { pluginKey: 'bubbleMenu1' })
    const view2 = createBubbleMenuView(editor, { pluginKey: 'bubbleMenu2' })

    const spy1 = vi.spyOn(view1, 'updatePosition')
    const spy2 = vi.spyOn(view2, 'updatePosition')

    editor.view.dispatch(editor.state.tr.setMeta('bubbleMenu1', 'updatePosition'))

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).not.toHaveBeenCalled()

    view1.destroy()
    view2.destroy()
    editor.destroy()
  })
  it('should not cross-contaminate options between two instances', () => {
    const editor = createEditor()

    const view1 = createBubbleMenuView(editor, {
      pluginKey: 'bubbleMenu1',
      updateDelay: 100,
    })
    const view2 = createBubbleMenuView(editor, {
      pluginKey: 'bubbleMenu2',
      updateDelay: 200,
    })

    editor.view.dispatch(
      editor.state.tr.setMeta('bubbleMenu1', {
        type: 'updateOptions',
        options: { updateDelay: 999 },
      }),
    )

    expect(view1.updateDelay).toBe(999)
    expect(view2.updateDelay).toBe(200)

    editor.view.dispatch(
      editor.state.tr.setMeta('bubbleMenu2', {
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
  it('should maintain backward compatibility with default "bubbleMenu" pluginKey', () => {
    const editor = createEditor()

    const view = createBubbleMenuView(editor)

    const spy = vi.spyOn(view, 'updateOptions')
    const newOptions = { updateDelay: 500 }

    editor.view.dispatch(
      editor.state.tr.setMeta('bubbleMenu', {
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

    const view1 = createBubbleMenuView(editor, { pluginKey: 'bubbleMenu1' })
    const view2 = createBubbleMenuView(editor, { pluginKey: 'bubbleMenu2' })

    const spy1 = vi.spyOn(view1, 'show')
    const spy2 = vi.spyOn(view2, 'show')

    editor.view.dispatch(editor.state.tr.setMeta('bubbleMenu1', 'show'))

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).not.toHaveBeenCalled()

    view1.destroy()
    view2.destroy()
    editor.destroy()
  })
  it('should only process hide for its own pluginKey', () => {
    const editor = createEditor()

    const view1 = createBubbleMenuView(editor, { pluginKey: 'bubbleMenu1' })
    const view2 = createBubbleMenuView(editor, { pluginKey: 'bubbleMenu2' })

    const spy1 = vi.spyOn(view1, 'hide')
    const spy2 = vi.spyOn(view2, 'hide')

    editor.view.dispatch(editor.state.tr.setMeta('bubbleMenu1', 'hide'))

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).not.toHaveBeenCalled()

    view1.destroy()
    view2.destroy()
    editor.destroy()
  })
})

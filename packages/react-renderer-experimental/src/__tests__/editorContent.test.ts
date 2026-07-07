import type { Editor } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import { history, redo, undo } from '@tiptap/pm/history'
import { Plugin, TextSelection } from '@tiptap/pm/state'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReactEditorView } from '../ReactEditorView.js'
import { renderTiptapEditor as renderEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

const pluginExtension = (plugin: Plugin) =>
  Extension.create({
    name: `test-${Math.random().toString(36).slice(2)}`,
    addProseMirrorPlugins: () => [plugin],
  })

describe('EditorContent', () => {
  it('mounts the editor on the React-rendered document element', async () => {
    const { editor, dom, view } = await renderEditor('<p>foo</p>')

    expect(view).toBeInstanceOf(ReactEditorView)
    expect(view.dom).toBe(dom)
    expect(dom.getAttribute('contenteditable')).toBe('true')
    expect(dom.innerHTML).toBe('<p>foo</p>')
    expect(dom.pmViewDesc?.node).toBe(editor.state.doc)
    // The doc attributes the base view would apply through computeDocDeco:
    // without the ProseMirror class, the injected whitespace CSS never
    // matches and spaces collapse
    expect(dom.classList.contains('ProseMirror')).toBe(true)
    expect(dom.getAttribute('translate')).toBe('no')
    expect(dom.getAttribute('role')).toBe('textbox')
    // The core tabindex extension's attribute must arrive as React tabIndex
    expect(dom.getAttribute('tabindex')).toBe('0')
  })

  it('renders command-driven edits without remounting siblings', async () => {
    const { editor, dom } = await renderEditor('<p>foo</p><p>bar</p>')
    const [el1, el2] = [...dom.children]

    await act(async () => {
      editor.commands.insertContentAt(2, 'x')
    })

    expect(dom.innerHTML).toBe('<p>fxoo</p><p>bar</p>')
    expect(dom.children[0]).toBe(el1)
    expect(dom.children[1]).toBe(el2)
  })

  it('updates React asynchronously: dispatch does not flush synchronously', async () => {
    const { editor, dom } = await renderEditor('<p>foo</p>')

    // Outside act: the state advances immediately, the DOM does not
    editor.commands.insertContentAt(2, 'x')

    expect(editor.state.doc.textContent).toBe('fxoo')
    expect(dom.innerHTML).toBe('<p>foo</p>')

    await act(async () => {})

    expect(dom.innerHTML).toBe('<p>fxoo</p>')
  })

  it('syncs the DOM selection after commit', async () => {
    const { editor, dom, view } = await renderEditor('<p>foo</p><p>bar</p>')

    await act(async () => {
      view.focus()
      editor.commands.setTextSelection({ from: 2, to: 8 })
    })

    const domSel = document.getSelection()
    const text1 = dom.children[0].firstChild as Text
    const text2 = dom.children[1].firstChild as Text

    expect(domSel?.anchorNode).toBe(text1)
    expect(domSel?.anchorOffset).toBe(1)
    expect(domSel?.focusNode).toBe(text2)
    expect(domSel?.focusOffset).toBe(2)
  })

  it('initializes and updates plugin views on commit', async () => {
    const update = vi.fn()
    const init = vi.fn(() => ({ update }))
    const plugin = new Plugin({ view: init })

    const { editor } = await renderEditor('<p>foo</p>', [pluginExtension(plugin)])

    expect(init).toHaveBeenCalledTimes(1)

    await act(async () => {
      editor.commands.insertContentAt(2, 'x')
    })

    expect(update).toHaveBeenCalled()
  })

  it('restores content and selection through undo/redo', async () => {
    const { editor, dom, view } = await renderEditor('<p>foo</p>', [pluginExtension(history())])

    await act(async () => {
      editor.commands.insertContentAt({ from: 1, to: 4 }, 'changed')
    })
    expect(dom.innerHTML).toBe('<p>changed</p>')

    await act(async () => {
      undo(view.state, view.dispatch)
    })
    expect(dom.innerHTML).toBe('<p>foo</p>')
    expect(editor.state.doc.textContent).toBe('foo')

    await act(async () => {
      redo(view.state, view.dispatch)
    })
    expect(dom.innerHTML).toBe('<p>changed</p>')
  })

  /**
   * Simulates a composition: marks the view composing (`view.composing`
   * reads this internal), dispatches an edit, and returns a finish function
   * that ends the composition and asserts React caught up.
   */
  const composeEdit = async (editor: Editor, dom: HTMLElement, view: ReactEditorView) => {
    const input = (view as unknown as { input: { composing: boolean } }).input

    input.composing = true
    await act(async () => {
      editor.commands.insertContentAt(2, 'x')
    })

    return async () => {
      await act(async () => {
        input.composing = false
        dom.dispatchEvent(new Event('compositionend'))
      })
      expect(dom.innerHTML).toBe('<p>fxoo</p>')
    }
  }

  it('defers re-renders while an IME composition is active', async () => {
    const { editor, dom, view } = await renderEditor('<p>foo</p>')
    const finish = await composeEdit(editor, dom, view)

    // React must not touch the DOM while the browser owns it
    expect(editor.state.doc.textContent).toBe('fxoo')
    expect(dom.innerHTML).toBe('<p>foo</p>')

    await finish()
  })

  it('keeps the frozen state through parent re-renders while composing', async () => {
    const { editor, dom, view, root } = await renderEditor('<p>foo</p>')
    const { createElement } = await import('react')
    const { EditorContent } = await import('../components/EditorContent.js')
    const finish = await composeEdit(editor, dom, view)

    // A parent-triggered re-render must not smuggle the new state past the guard
    await act(async () => {
      root.render(createElement(EditorContent, { editor, 'data-rerender': '1' } as never))
    })

    expect(dom.innerHTML).toBe('<p>foo</p>')

    await finish()
  })

  it('round-trips a collapsed selection set from the DOM side', async () => {
    const { dom, view } = await renderEditor('<p>foo</p><p>bar</p>')
    const text2 = dom.children[1].firstChild as Text

    // Second paragraph starts at 5, its text at 6; offset 2 in "bar" is 8
    const pos = view.posAtDOM(text2, 2)

    expect(pos).toBe(8)
    expect(view.domAtPos(8).node).toBe(text2)
    expect(TextSelection.create(view.state.doc, pos).head).toBe(8)
  })
})

import type { EditorInternalOptions, EditorOptions } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Schema } from '@tiptap/pm/model'
import type { EditorState } from '@tiptap/pm/state'
import { EditorState as State, Plugin } from '@tiptap/pm/state'
import { describe, expect, it, vi } from 'vitest'

import { EMPTY_STATE } from '../constants.js'
import type { DocViewLike } from '../ReactEditorView.js'
import { ReactEditorView } from '../ReactEditorView.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0],
    },
    text: { group: 'inline' },
  },
})

const makeState = (plugins: Plugin[] = []): EditorState => State.create({ schema, plugins })

const makeMount = () => {
  const mount = document.createElement('div')
  mount.setAttribute('data-owner', 'react')
  const reactChild = document.createElement('p')
  reactChild.textContent = 'react owned'
  mount.appendChild(reactChild)
  return { mount, reactChild }
}

const stubDocView = (): DocViewLike => ({
  matchesNode: () => true,
  update: () => true,
  markDirty: vi.fn(),
  destroy: vi.fn(),
})

// Typed access to the private prosemirror-view fields the tests assert on
const internalsOf = (view: ReactEditorView) =>
  view as unknown as {
    docView: DocViewLike | null
    domObserver: { observer: MutationObserver | null; queue: MutationRecord[] }
    _props: { state: EditorState }
  }

describe('ReactEditorView', () => {
  it('constructs without rendering or mutating the mount element', () => {
    const { mount, reactChild } = makeMount()
    const state = makeState()

    const view = new ReactEditorView(mount, { state })

    expect(view.dom).toBe(mount)
    expect(view.state).toBe(state)
    expect(typeof view.dispatch).toBe('function')

    // No base-rendered document DOM, classes, or contenteditable
    expect(Array.from(mount.childNodes)).toEqual([reactChild])
    expect(mount.hasAttribute('class')).toBe(false)
    expect(mount.hasAttribute('contenteditable')).toBe(false)
    expect(mount.getAttribute('data-owner')).toBe('react')

    expect(internalsOf(view).docView).toBeNull()
    expect(internalsOf(view).domObserver.observer).toBeNull()
    expect(internalsOf(view).domObserver.queue).toHaveLength(0)

    view.destroy()
  })

  it('rejects function and null placements', () => {
    expect(() => new ReactEditorView(null as never, { state: makeState() })).toThrow(
      /requires an HTMLElement/,
    )
  })

  it('stages prop and state updates without touching the DOM', () => {
    const { mount, reactChild } = makeMount()
    const view = new ReactEditorView(mount, { state: makeState() })

    const next = view.state.apply(view.state.tr.insertText('hello', 1))
    view.updateState(next)

    // The new state is exposed immediately
    expect(view.state).toBe(next)
    expect(view.state.doc.textContent).toBe('hello')
    expect(view.props.state).toBe(next)

    // ...but nothing was committed to the base class or the DOM
    expect(internalsOf(view)._props.state).toBe(EMPTY_STATE)
    expect(Array.from(mount.childNodes)).toEqual([reactChild])

    // setProps merges partial props with the same pure semantics
    const handleClick = () => false
    view.setProps({ handleClick })
    expect(view.props.handleClick).toBe(handleClick)
    expect(view.props.state).toBe(next)
    expect(internalsOf(view)._props.state).toBe(EMPTY_STATE)

    view.destroy()
  })

  it('initializes and updates plugin views through commitPendingEffects', () => {
    const pluginView = { update: vi.fn(), destroy: vi.fn() }
    const createPluginView = vi.fn(() => pluginView)
    const plugin = new Plugin({ view: createPluginView })

    const { mount } = makeMount()
    const state = makeState([plugin])
    const view = new ReactEditorView(mount, { state })

    // Nothing is committed while no doc view is registered
    view.commitPendingEffects()
    expect(createPluginView).not.toHaveBeenCalled()

    internalsOf(view).docView = stubDocView()
    view.commitPendingEffects()

    expect(createPluginView).toHaveBeenCalledTimes(1)
    expect(createPluginView).toHaveBeenCalledWith(view)
    expect(internalsOf(view)._props.state).toBe(state)

    // A later commit updates the existing plugin view instead of recreating it
    const next = view.state.apply(view.state.tr.insertText('x', 1))
    view.updateState(next)
    view.commitPendingEffects()

    expect(createPluginView).toHaveBeenCalledTimes(1)
    expect(pluginView.update).toHaveBeenCalledWith(view, state)
    expect(internalsOf(view)._props.state).toBe(next)

    view.destroy()
    expect(pluginView.destroy).toHaveBeenCalledTimes(1)
  })

  it('tears down cleanly while restoring React-owned children', () => {
    const { mount, reactChild } = makeMount()
    const view = new ReactEditorView(mount, { state: makeState() })

    expect(view.isDestroyed).toBe(false)
    view.destroy()

    expect(view.isDestroyed).toBe(true)
    expect(Array.from(mount.childNodes)).toEqual([reactChild])

    // Destroying twice is a no-op
    expect(() => view.destroy()).not.toThrow()
  })

  it('integrates with the Editor through the internal view factory', () => {
    const { mount, reactChild } = makeMount()

    const options: Partial<EditorOptions & EditorInternalOptions> = {
      element: mount,
      extensions: [Document, Paragraph, Text],
      content: '<p>hello</p>',
      injectCSS: false,
      __internalViewFactory: (element, props) => new ReactEditorView(element as Element, props),
    }
    const editor = new Editor(options)

    expect(editor.view).toBeInstanceOf(ReactEditorView)
    expect(editor.view.dom).toBe(mount)
    expect(editor.state.doc.textContent).toBe('hello')

    // ProseMirror never rendered the document; React's DOM is intact
    expect(Array.from(mount.childNodes)).toEqual([reactChild])
    expect(mount.className.includes('ProseMirror')).toBe(false)
    expect(mount.hasAttribute('contenteditable')).toBe(false)

    editor.destroy()
    expect(Array.from(mount.childNodes)).toEqual([reactChild])
  })
})

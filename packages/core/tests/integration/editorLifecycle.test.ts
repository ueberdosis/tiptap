import { Editor, Extension } from '@tiptap/core'
import type { FocusPosition } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

const editors: Editor[] = []
const createEditor = () => {
  const editor = new Editor({ element: null, extensions: [StarterKit], content: '<p>Hello</p>' })
  editors.push(editor)
  return editor
}

afterEach(() => {
  editors.forEach(editor => editor.destroy())
  editors.length = 0
  vi.useRealTimers()
})

describe('editor lifecycle', () => {
  it('keeps an unmounted editor alive and editable before and after mounting', () => {
    const editor = createEditor()
    expect(editor.isDestroyed).toBe(false)
    expect(editor.isMounted).toBe(false)
    editor.commands.setContent('<p>Before</p>')
    editor.mount(document.createElement('div'))
    expect(editor.isMounted).toBe(true)
    expect(editor.getText()).toBe('Before')
    editor.unmount()
    expect(editor.isMounted).toBe(false)
    expect(editor.isDestroyed).toBe(false)
    editor.commands.setContent('<p>After</p>')
    editor.mount(document.createElement('div'))
    expect(editor.view.dom.textContent).toBe('After')
  })

  it('makes repeated mount and unmount calls harmless', () => {
    const editor = createEditor()
    const mount = vi.fn()
    const unmount = vi.fn()
    editor.on('mount', mount)
    editor.on('unmount', unmount)
    editor.unmount()
    expect(unmount).not.toHaveBeenCalled()
    const element = document.createElement('div')
    editor.mount(element)
    const view = editor.view
    editor.mount(element)
    expect(editor.view).toBe(view)
    expect(mount).toHaveBeenCalledTimes(1)
    editor.unmount()
    editor.unmount()
    expect(view.isDestroyed).toBe(true)
    expect(unmount).toHaveBeenCalledTimes(1)
  })

  it('destroys the previous view when mounting at a different element', () => {
    const editor = createEditor()
    editor.mount(document.createElement('div'))
    const view = editor.view
    const element = document.createElement('div')
    editor.mount(element)
    expect(view.isDestroyed).toBe(true)
    expect(editor.options.element).toBe(element)
    expect(element.contains(editor.view.dom)).toBe(true)
  })

  it('cancels create callbacks for mounts that have ended', () => {
    vi.useFakeTimers()
    const editor = createEditor()
    const create = vi.fn()
    editor.on('create', create)
    editor.mount(document.createElement('div'))
    editor.unmount()
    vi.runAllTimers()
    expect(create).not.toHaveBeenCalled()
    expect(editor.isInitialized).toBe(false)
    editor.mount(document.createElement('div'))
    editor.unmount()
    editor.mount(document.createElement('div'))
    vi.runAllTimers()
    expect(create).toHaveBeenCalledTimes(1)
    expect(editor.isInitialized).toBe(true)
  })

  it('emits create once and initializes each mounted view', () => {
    vi.useFakeTimers()
    const editor = new Editor({
      element: null,
      extensions: [StarterKit],
      autofocus: true,
    })
    editors.push(editor)
    const create = vi.fn()
    editor.on('create', create)

    editor.mount(document.createElement('div'))
    vi.runAllTimers()

    expect(create).toHaveBeenCalledTimes(1)
    expect(editor.isInitialized).toBe(true)

    editor.unmount()
    editor.mount(document.createElement('div'))
    vi.runAllTimers()

    expect(create).toHaveBeenCalledTimes(1)
    expect(editor.isInitialized).toBe(true)
  })

  it.each<{ autofocus: FocusPosition; from: number; to: number }>([
    { autofocus: 'start', from: 1, to: 1 },
    { autofocus: true, from: 1, to: 1 },
    { autofocus: 'end', from: 6, to: 6 },
    { autofocus: 'all', from: 1, to: 6 },
    { autofocus: 3, from: 3, to: 3 },
  ])('preserves the remounted selection with autofocus=$autofocus', ({ autofocus, from, to }) => {
    vi.useFakeTimers()
    const editor = new Editor({
      element: null,
      extensions: [StarterKit],
      content: '<p>Hello</p>',
      autofocus,
    })
    editors.push(editor)
    editor.commands.setTextSelection({ from: 2, to: 4 })
    editor.mount(document.createElement('div'))
    vi.runAllTimers()
    expect(editor.state.selection.from).toBe(from)
    expect(editor.state.selection.to).toBe(to)

    editor.commands.setTextSelection({ from: 2, to: 4 })
    editor.unmount()
    editor.mount(document.createElement('div'))
    vi.runAllTimers()
    expect(editor.state.selection.from).toBe(2)
    expect(editor.state.selection.to).toBe(4)
  })

  it('preserves plugin state and registered plugins across remounts', () => {
    const key = new PluginKey<number>('lifecycleCounter')
    const editor = new Editor({
      element: null,
      extensions: [
        StarterKit,
        Extension.create({
          name: 'lifecycleCounter',
          addProseMirrorPlugins() {
            return [
              new Plugin({
                key,
                state: { init: () => 0, apply: (_transaction, value) => value + 1 },
              }),
            ]
          },
        }),
      ],
    })
    editors.push(editor)
    editor.mount(document.createElement('div'))
    editor.commands.insertContent('Hello')
    editor.commands.setTextSelection({ from: 1, to: 4 })
    const count = key.getState(editor.state)
    const registered = new Plugin({ key: new PluginKey('registered') })
    editor.registerPlugin(registered)
    editor.unmount()
    editor.mount(document.createElement('div'))
    expect(key.getState(editor.state)).toBe(count)
    expect(editor.state.plugins).toContain(registered)
    expect(editor.state.selection.from).toBe(1)
    expect(editor.state.selection.to).toBe(4)
  })

  it('keeps plugins registered before the first mount', () => {
    const editor = createEditor()
    const plugin = new Plugin({ key: new PluginKey('beforeMount') })
    editor.registerPlugin(plugin)
    editor.mount(document.createElement('div'))
    expect(editor.state.plugins).toContain(plugin)
  })

  it('provides the active view to plugin views on remount', () => {
    const editor = createEditor()
    editor.mount(document.createElement('div'))
    const elements: HTMLElement[] = []
    editor.registerPlugin(
      new Plugin({
        view: () => {
          elements.push(editor.view.dom)
          return {}
        },
      }),
    )
    editor.unmount()
    expect(() => editor.mount(document.createElement('div'))).not.toThrow()
    expect(elements).toHaveLength(2)
    expect(elements[1]).toBe(editor.view.dom)
  })

  it('makes destroy final even when the editor was never mounted', () => {
    const editor = createEditor()
    const destroy = vi.fn()
    const unmount = vi.fn()
    editor.on('destroy', destroy)
    editor.on('unmount', unmount)
    editor.destroy()
    editor.destroy()
    expect(editor.isDestroyed).toBe(true)
    expect(editor.isMounted).toBe(false)
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(unmount).not.toHaveBeenCalled()
    expect(() => editor.mount(document.createElement('div'))).toThrow(/destroyed/)
  })
})

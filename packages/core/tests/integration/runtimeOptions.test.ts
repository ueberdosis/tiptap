import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

describe('runtime editor options', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
    vi.restoreAllMocks()
  })

  it('calls only the latest option callback and keeps event listeners', () => {
    const original = vi.fn()
    const replacement = vi.fn()
    const listener = vi.fn()
    editor = new Editor({ extensions: [StarterKit], onUpdate: original })
    editor.on('update', listener)

    editor.setOptions({ onUpdate: replacement })
    editor.setOptions({ onUpdate: replacement })
    editor.commands.insertContent('Hello')

    expect(original).not.toHaveBeenCalled()
    expect(replacement).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('warns and keeps initial options while applying live options', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const extensions = [StarterKit]
    editor = new Editor({ extensions, content: '<p>Original</p>' })
    const schema = editor.schema
    const view = editor.view

    editor.setOptions({ content: '<p>Replacement</p>', extensions: [], editable: false })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('content'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('extensions'))
    expect(editor.options.content).toBe('<p>Original</p>')
    expect(editor.options.extensions).toBe(extensions)
    expect(editor.getText()).toBe('Original')
    expect(editor.isEditable).toBe(false)
    expect(editor.schema).toBe(schema)
    expect(editor.view).toBe(view)
  })

  it('does not warn when initial values are unchanged', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const extensions = [StarterKit]
    editor = new Editor({ extensions, content: '<p>Original</p>' })
    editor.setOptions({ extensions, content: '<p>Original</p>' })
    expect(warn).not.toHaveBeenCalled()
  })

  it('updates callbacks before mounting and on destruction', () => {
    const original = vi.fn()
    const onMount = vi.fn()
    const onDestroy = vi.fn()
    editor = new Editor({ element: null, extensions: [StarterKit], onMount: original })
    editor.setOptions({ onMount, onDestroy })
    editor.mount(document.createElement('div'))
    editor.destroy()
    expect(original).not.toHaveBeenCalled()
    expect(onMount).toHaveBeenCalledTimes(1)
    expect(onDestroy).toHaveBeenCalledTimes(1)
  })
  it('keeps the editor as the callback receiver', () => {
    let receiverMatches = false
    editor = new Editor({ extensions: [StarterKit] })
    editor.setOptions({
      onUpdate: function (this: Editor) {
        receiverMatches = this === editor
      },
    })
    editor.commands.insertContent('Hello')
    expect(receiverMatches).toBe(true)
  })
})

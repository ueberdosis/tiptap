import { Editor } from '@tiptap/core'
import { CharacterCount, Placeholder } from '@tiptap/extensions'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vite-plus/test'

describe('runtime extension settings', () => {
  const editors: Editor[] = []
  const createEditor = (showOnlyCurrent = true) => {
    const editor = new Editor({
      extensions: [StarterKit, Placeholder.configure({ showOnlyCurrent }), CharacterCount],
    })
    editors.push(editor)
    return editor
  }

  afterEach(() => {
    editors.forEach(editor => editor.destroy())
    editors.length = 0
  })

  it.each([true, false])(
    'updates visible placeholders immediately, current only: %s',
    showOnlyCurrent => {
      const editor = createEditor(showOnlyCurrent)
      const view = editor.view
      const doc = editor.state.doc
      const selection = editor.state.selection
      expect(editor.commands.setPlaceholder('New prompt')).toBe(true)
      expect(editor.view.dom.querySelector('p')?.getAttribute('data-placeholder')).toBe(
        'New prompt',
      )
      expect(editor.view).toBe(view)
      expect(editor.state.doc).toBe(doc)
      expect(editor.state.selection.eq(selection)).toBe(true)
      editor.commands.setPlaceholder(({ node }) => `New ${node.type.name}`)
      expect(editor.view.dom.querySelector('p')?.getAttribute('data-placeholder')).toBe(
        'New paragraph',
      )
    },
  )

  it('keeps settings local to each editor and capability checks do not change them', () => {
    const editor = createEditor()
    const other = createEditor()
    expect(editor.can().setPlaceholder('Dry run')).toBe(true)
    expect(editor.can().setCharacterLimit(1)).toBe(true)
    expect(editor.view.dom.querySelector('p')?.getAttribute('data-placeholder')).not.toBe('Dry run')
    editor.commands.setPlaceholder('Only here')
    editor.commands.setCharacterLimit(1)
    other.commands.insertContent('Hello')
    expect(other.getText()).toBe('Hello')
    expect(other.view.dom.querySelector('p')?.getAttribute('data-placeholder')).not.toBe(
      'Only here',
    )
  })

  it('keeps existing content when lowering the limit and permits deletion', () => {
    const editor = createEditor()
    editor.commands.insertContent('Hello')
    editor.commands.setCharacterLimit(3)
    expect(editor.getText()).toBe('Hello')
    editor.commands.insertContent('!')
    expect(editor.getText()).toBe('Hello')
    editor.commands.deleteRange({ from: 4, to: 6 })
    expect(editor.getText()).toBe('Hel')
    editor.commands.insertContent('!')
    expect(editor.getText()).toBe('Hel')
    editor.commands.setCharacterLimit(null)
    editor.commands.insertContent('!')
    expect(editor.getText()).toBe('Hel!')
  })

  it('does not trim initial content when the first transaction sets a limit', () => {
    const editor = new Editor({ extensions: [StarterKit, CharacterCount], content: '<p>Hello</p>' })
    editors.push(editor)
    editor.commands.setCharacterLimit(2)
    expect(editor.getText()).toBe('Hello')
  })

  it('rejects invalid limits without changing the current limit', () => {
    const editor = createEditor()
    editor.commands.setCharacterLimit(3)
    for (const limit of [-1, NaN, Infinity]) {
      expect(editor.commands.setCharacterLimit(limit)).toBe(false)
    }
    editor.commands.insertContent('four')
    expect(editor.getText()).toBe('')
  })

  it('keeps runtime settings across undo', () => {
    const editor = createEditor()
    editor.commands.insertContent('Hello')
    editor.commands.setPlaceholder('Still here')
    editor.commands.setCharacterLimit(2)
    editor.commands.undo()
    expect(editor.getText()).toBe('')
    expect(editor.view.dom.querySelector('p')?.getAttribute('data-placeholder')).toBe('Still here')
    editor.commands.insertContent('abc')
    expect(editor.getText()).toBe('')
  })
  it('keeps chained document edits undoable', () => {
    const editor = createEditor()
    editor.chain().setPlaceholder('Prompt').insertContent('Hello').run()
    expect(editor.getText()).toBe('Hello')
    expect(editor.commands.undo()).toBe(true)
    expect(editor.getText()).toBe('')
  })

  it('keeps a lowered limit and existing content after remounting', () => {
    const editor = createEditor()
    editor.commands.insertContent('Hello')
    editor.commands.setCharacterLimit(2)
    editor.commands.setPlaceholder('Prompt')
    editor.unmount()
    editor.mount(document.createElement('div'))
    editor.commands.setTextSelection(1)
    expect(editor.getText()).toBe('Hello')
    editor.commands.insertContent('!')
    expect(editor.getText()).toBe('Hello')
    editor.commands.clearContent()
    expect(editor.view.dom.querySelector('p')?.getAttribute('data-placeholder')).toBe('Prompt')
  })

  it('uses the new limit for document edits in the same chain', () => {
    const editor = createEditor()
    editor.chain().setCharacterLimit(2).insertContent('abc').run()
    expect(editor.getText()).toBe('')
    editor.commands.setCharacterLimit(2)
    editor.chain().setCharacterLimit(null).insertContent('abc').run()
    expect(editor.getText()).toBe('abc')
    expect(editor.commands.undo()).toBe(true)
    expect(editor.getText()).toBe('')
  })

  it.each([true, false])(
    'keeps updates made while read-only, current only: %s',
    showOnlyCurrent => {
      const editor = createEditor(showOnlyCurrent)
      editor.setEditable(false)
      editor.commands.setPlaceholder('Updated while read-only')
      editor.setEditable(true)
      expect(editor.view.dom.querySelector('p')?.getAttribute('data-placeholder')).toBe(
        'Updated while read-only',
      )
    },
  )
})

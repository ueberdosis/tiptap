import { Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import { UniqueID } from '@tiptap/extension-unique-id'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'

describe.each([false, true])('input rule undo with UniqueID, collaboration: %s', collaboration => {
  let editor: Editor
  let document: Y.Doc

  afterEach(() => {
    editor.destroy()
    document.destroy()
  })

  const convert = async ({ marker, type }: { marker: string; type: string }) => {
    document = new Y.Doc()
    editor = new Editor({
      extensions: [
        StarterKit.configure({ trailingNode: false, undoRedo: collaboration ? false : {} }),
        UniqueID.configure({ types: [type] }),
        ...(collaboration ? [Collaboration.configure({ document })] : []),
      ],
    })
    await new Promise<void>(resolve => setTimeout(resolve, 10))
    editor.commands.insertContent(marker)

    const { from, to } = editor.state.selection
    expect(
      editor.view.someProp('handleTextInput', handler => handler(editor.view, from, to, ' ')),
    ).toBe(true)
    expect(editor.state.doc.firstChild?.type.name).toBe(type)
    expect(editor.state.doc.firstChild?.attrs.id).toEqual(expect.any(String))
  }

  it.each([
    { marker: '##', type: 'heading' },
    { marker: '>', type: 'blockquote' },
  ])('reverses $type conversion after assigning an ID', async ({ marker, type }) => {
    await convert({ marker, type })
    expect(
      editor.view.someProp('handleKeyDown', handler =>
        handler(editor.view, new KeyboardEvent('keydown', { key: 'Backspace' })),
      ),
    ).toBe(true)
    expect(editor.state.doc.firstChild?.type.name).toBe('paragraph')
    expect(editor.getText()).toBe(`${marker} `)
    expect(editor.state.selection.from).toBe(marker.length + 2)
  })

  it('clears input rule undo after further typing', async () => {
    await convert({ marker: '##', type: 'heading' })

    editor.commands.insertContent('text')

    expect(editor.commands.undoInputRule()).toBe(false)
    expect(editor.getText()).toBe('text')
  })

  it('clears input rule undo after moving the selection', async () => {
    await convert({ marker: '##', type: 'heading' })

    editor.commands.setTextSelection(1)

    expect(editor.commands.undoInputRule()).toBe(false)
  })
})

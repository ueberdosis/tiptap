import { Editor } from '@tiptap/core'
import { TableKit } from '@tiptap/extension-table'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { TaskItem, TaskList } from '../../src/index.js'

function findTextStart(editor: Editor, text: string) {
  let position: number | undefined

  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.text === text) {
      position = pos
    }
  })

  if (position === undefined) {
    throw new Error(`Could not find text "${text}"`)
  }

  return position
}

function pressKey(editor: Editor, key: string) {
  return editor.view.someProp('handleKeyDown', handler =>
    handler(editor.view, new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })),
  )
}

describe('ListKeymap partial joins (#8563)', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('keeps the cursor in the paragraph moved after a table by Backspace', () => {
    editor = new Editor({
      extensions: [StarterKit.configure({ trailingNode: false }), TableKit],
      content:
        '<ul><li><p>one</p><table><tbody><tr><td><p>cell</p></td></tr></tbody></table></li></ul><p>after</p>',
    })
    editor.commands.setTextSelection(findTextStart(editor, 'after'))
    const originalHTML = editor.getHTML()

    expect(pressKey(editor, 'Backspace')).toBe(true)
    expect(editor.state.doc.childCount).toBe(1)
    expect(editor.state.doc.firstChild?.firstChild?.lastChild?.textContent).toBe('after')
    expect(editor.state.selection.empty).toBe(true)
    expect(editor.state.selection.from).toBe(findTextStart(editor, 'after'))

    expect(editor.commands.undo()).toBe(true)
    expect(editor.getHTML()).toBe(originalHTML)
    expect(editor.commands.redo()).toBe(true)
    editor.commands.insertContent('a')
    expect(editor.state.doc.textContent).toBe('onecellaafter')
  })

  it('joins the next outer item onto the last nested item with Delete', () => {
    editor = new Editor({
      extensions: [StarterKit.configure({ trailingNode: false })],
      content:
        '<ul><li><p>one</p><ul><li><p>sub</p></li></ul></li><li><p>two</p></li><li><p>three</p></li></ul>',
    })
    editor.commands.setTextSelection(findTextStart(editor, 'sub') + 3)
    const originalHTML = editor.getHTML()

    expect(pressKey(editor, 'Delete')).toBe(true)
    expect(editor.getHTML()).toBe(
      '<ul><li><p>one</p><ul><li><p>subtwo</p></li></ul></li><li><p>three</p></li></ul>',
    )
    expect(editor.state.selection.from).toBe(findTextStart(editor, 'subtwo') + 3)
    expect(editor.commands.undo()).toBe(true)
    expect(editor.getHTML()).toBe(originalHTML)
    expect(editor.commands.redo()).toBe(true)
    expect(editor.state.doc.textContent).toBe('onesubtwothree')
  })

  it('joins a checked outer task into the nested task without creating an unchecked task', () => {
    editor = new Editor({
      extensions: [
        StarterKit.configure({ trailingNode: false }),
        TaskList,
        TaskItem.configure({ nested: true }),
      ],
      content: `<ul data-type="taskList">
        <li data-type="taskItem" data-checked="false"><p>one</p>
          <ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>sub</p></li></ul>
        </li>
        <li data-type="taskItem" data-checked="true"><p>two</p></li>
        <li data-type="taskItem" data-checked="true"><p>three</p></li>
      </ul>`,
    })
    editor.commands.setTextSelection(findTextStart(editor, 'sub') + 3)

    expect(pressKey(editor, 'Delete')).toBe(true)

    const list = editor.state.doc.child(0)
    const nestedList = list.child(0).child(1)

    expect(list.childCount).toBe(2)
    expect(nestedList.childCount).toBe(1)
    expect(nestedList.firstChild?.textContent).toBe('subtwo')
    expect(nestedList.firstChild?.attrs.checked).toBe(false)
    expect(list.lastChild?.attrs.checked).toBe(true)
    expect(list.lastChild?.textContent).toBe('three')
  })
})

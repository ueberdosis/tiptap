import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from '../src/index.js'

// taskList has a different content model (taskItem+) than bulletList/orderedList
// (listItem+), so cross-family conversions go through toggleList's wrapInList
// + clearNodes fallback branch rather than the setNodeMarkup "change list
// type" branch used for bulletList <-> orderedList. That fallback had a
// separate, more severe bug: clearNodes() lifted every non-text node in the
// selection (including list/listItem/taskList/taskItem wrapper nodes, not
// just textblocks) in document order, using positions mapped against a doc
// that earlier iterations in the same pass had already mutated. For a
// taskList nested inside a taskItem inside a taskList, this ejected the
// nested item's paragraph out of the list entirely, orphaning it as a bare
// top-level paragraph sibling — outright content loss, not just a wrong
// list type.
describe('toggleList with taskList (cross-family, nested content)', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  const setup = (content: string) => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        ListItem,
        BulletList,
        OrderedList,
        TaskItem.configure({ nested: true }),
        TaskList,
      ],
      content,
    })
    return editor
  }

  const nestedTaskListDoc = `
    <ul data-type="taskList">
      <li data-type="taskItem" data-checked="false">
        <p>Item 1</p>
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="false"><p>Item 1-1</p></li>
        </ul>
      </li>
    </ul>
  `

  const nestedBulletListDoc = `
    <ul>
      <li>
        <p>Item 1</p>
        <ul>
          <li><p>Item 1-1</p></li>
        </ul>
      </li>
    </ul>
  `

  it('does not drop nested content when converting nested taskList to bulletList', () => {
    setup(nestedTaskListDoc)
    editor.commands.selectAll()
    editor.commands.toggleBulletList()

    // The critical invariant: no text is lost. Previously "Item 1-1" was
    // ejected out of the list as an orphaned top-level paragraph.
    expect(editor.getText()).toContain('Item 1')
    expect(editor.getText()).toContain('Item 1-1')

    const json = editor.getJSON()
    // Everything stays inside a single top-level list — nothing orphaned
    // as a bare sibling paragraph outside of it.
    expect(json.content).toHaveLength(1)
    expect(json.content![0].type).toBe('bulletList')
  })

  it('does not drop nested content when converting nested bulletList to taskList', () => {
    setup(nestedBulletListDoc)
    editor.commands.selectAll()
    editor.commands.toggleTaskList()

    expect(editor.getText()).toContain('Item 1')
    expect(editor.getText()).toContain('Item 1-1')

    const json = editor.getJSON()
    expect(json.content).toHaveLength(1)
    expect(json.content![0].type).toBe('taskList')
  })

  it('does not drop nested content when converting nested taskList to orderedList', () => {
    setup(nestedTaskListDoc)
    editor.commands.selectAll()
    editor.commands.toggleOrderedList()

    expect(editor.getText()).toContain('Item 1')
    expect(editor.getText()).toContain('Item 1-1')

    const json = editor.getJSON()
    expect(json.content).toHaveLength(1)
    expect(json.content![0].type).toBe('orderedList')
  })
})

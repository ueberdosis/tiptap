import type { JSONContent } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from '../src/index.js'

// taskList has a different content model (taskItem+) than bulletList/orderedList
// (listItem+), so cross-family conversions go through toggleList's wrapInList
// + clearNodes fallback branch rather than the setNodeMarkup "change list
// type" branch used for bulletList <-> orderedList. That fallback had two
// bugs:
//
// 1. clearNodes() lifted every non-text node in the selection (including
//    list/listItem/taskList/taskItem wrapper nodes, not just textblocks) in
//    document order, using positions mapped against a doc that earlier
//    iterations in the same pass had already mutated. For a taskList nested
//    inside a taskItem inside a taskList, this ejected the nested item's
//    paragraph out of the list entirely — outright content loss.
//
// 2. Nested sublists that survived inside the wrapped items kept their old
//    family entirely (taskList stayed taskList inside the new bulletList,
//    and vice versa), because setNodeMarkup can't convert across families:
//    the item node types themselves (taskItem vs listItem) are incompatible
//    and the subtree has to be rebuilt node by node.
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

  const collectNodeTypes = (node: JSONContent, wanted: string[], acc: string[] = []): string[] => {
    if (node.type && wanted.includes(node.type)) {
      acc.push(node.type)
    }
    ;(node.content || []).forEach(child => collectNodeTypes(child, wanted, acc))
    return acc
  }

  const listTypesIn = (json: JSONContent) =>
    collectNodeTypes({ type: 'doc', content: json.content }, [
      'bulletList',
      'orderedList',
      'taskList',
    ])

  const itemTypesIn = (json: JSONContent) =>
    collectNodeTypes({ type: 'doc', content: json.content }, ['listItem', 'taskItem'])

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

  it('fully converts a nested taskList to bulletList, including the nested sublist', () => {
    setup(nestedTaskListDoc)
    editor.commands.selectAll()
    editor.commands.toggleBulletList()

    // No text is lost. Previously "Item 1-1" was ejected out of the list
    // as an orphaned top-level paragraph.
    expect(editor.getText()).toContain('Item 1')
    expect(editor.getText()).toContain('Item 1-1')

    const json = editor.getJSON()
    // Everything stays inside a single top-level list — nothing orphaned.
    expect(json.content).toHaveLength(1)
    expect(json.content![0].type).toBe('bulletList')

    // The nested sublist converts too: no taskList/taskItem remains anywhere.
    expect(listTypesIn(json)).toEqual(['bulletList', 'bulletList'])
    expect(itemTypesIn(json)).toEqual(['listItem', 'listItem'])
  })

  it('fully converts a nested bulletList to taskList, including the nested sublist', () => {
    setup(nestedBulletListDoc)
    editor.commands.selectAll()
    editor.commands.toggleTaskList()

    expect(editor.getText()).toContain('Item 1')
    expect(editor.getText()).toContain('Item 1-1')

    const json = editor.getJSON()
    expect(json.content).toHaveLength(1)
    expect(json.content![0].type).toBe('taskList')

    expect(listTypesIn(json)).toEqual(['taskList', 'taskList'])
    expect(itemTypesIn(json)).toEqual(['taskItem', 'taskItem'])

    // Rebuilt task items get the taskItem defaults (unchecked).
    const outerItem = json.content![0].content![0]
    expect(outerItem.attrs?.checked).toBe(false)
  })

  it('fully converts a nested taskList to orderedList, including the nested sublist', () => {
    setup(nestedTaskListDoc)
    editor.commands.selectAll()
    editor.commands.toggleOrderedList()

    expect(editor.getText()).toContain('Item 1')
    expect(editor.getText()).toContain('Item 1-1')

    const json = editor.getJSON()
    expect(json.content).toHaveLength(1)
    expect(json.content![0].type).toBe('orderedList')

    expect(listTypesIn(json)).toEqual(['orderedList', 'orderedList'])
    expect(itemTypesIn(json)).toEqual(['listItem', 'listItem'])
  })

  it('converts a cross-family sublist nested inside a same-family toggle', () => {
    // Top-level bulletList -> orderedList is a same-family conversion
    // (setNodeMarkup branch), but the taskList nested inside one of its
    // items still needs the cross-family rebuild.
    setup(`
      <ul>
        <li>
          <p>Item 1</p>
          <ul data-type="taskList">
            <li data-type="taskItem" data-checked="true"><p>Item 1-1</p></li>
          </ul>
        </li>
      </ul>
    `)
    editor.commands.selectAll()
    editor.commands.toggleOrderedList()

    expect(editor.getText()).toContain('Item 1')
    expect(editor.getText()).toContain('Item 1-1')

    const json = editor.getJSON()
    expect(json.content).toHaveLength(1)
    expect(listTypesIn(json)).toEqual(['orderedList', 'orderedList'])
    expect(itemTypesIn(json)).toEqual(['listItem', 'listItem'])
  })

  it('drops the checked state when leaving the task family and round-trips without crashing', () => {
    // Bullet lists have no checked state, so converting away from taskList
    // intentionally drops it; converting back yields taskItem defaults.
    setup(`
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true"><p>Done thing</p></li>
      </ul>
    `)
    editor.commands.selectAll()
    editor.commands.toggleBulletList()

    editor.commands.selectAll()
    editor.commands.toggleTaskList()

    const json = editor.getJSON()
    expect(editor.getText()).toContain('Done thing')
    expect(json.content![0].type).toBe('taskList')
    expect(json.content![0].content![0].attrs?.checked).toBe(false)
  })

  it('converts a 3-level deep mixed nesting entirely', () => {
    setup(`
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false">
          <p>A</p>
          <ul data-type="taskList">
            <li data-type="taskItem" data-checked="false">
              <p>A-1</p>
              <ul data-type="taskList">
                <li data-type="taskItem" data-checked="false"><p>A-1-a</p></li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    `)
    editor.commands.selectAll()
    editor.commands.toggleBulletList()

    const json = editor.getJSON()
    expect(editor.getText()).toContain('A')
    expect(editor.getText()).toContain('A-1')
    expect(editor.getText()).toContain('A-1-a')
    expect(listTypesIn(json)).toEqual(['bulletList', 'bulletList', 'bulletList'])
    expect(itemTypesIn(json)).toEqual(['listItem', 'listItem', 'listItem'])
  })
})

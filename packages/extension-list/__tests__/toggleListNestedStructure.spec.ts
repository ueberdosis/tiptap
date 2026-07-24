import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { BulletList, ListItem, OrderedList } from '../src/index.js'

describe('toggleList preserves nested list structure', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('converts nested bulletList to orderedList when toggling the whole selection', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, BulletList, OrderedList],
      content: `
        <ul>
          <li><p>Item 1</p></li>
          <li>
            <p>Item 2</p>
            <ul>
              <li><p>Item 2-1</p></li>
              <li><p>Item 2-2</p></li>
            </ul>
          </li>
          <li><p>Item 3</p></li>
        </ul>
      `,
    })

    editor.commands.selectAll()
    editor.commands.toggleOrderedList()

    const json = editor.getJSON()

    expect(json.content).toHaveLength(1)
    expect(json.content![0].type).toBe('orderedList')

    const outerItems = json.content![0].content!
    expect(outerItems).toHaveLength(3)

    // The nested list inside "Item 2" must also have been converted —
    // previously it kept its original bulletList type.
    const nestedListNode = outerItems[1].content!.find(node => node.type === 'bulletList')
    expect(nestedListNode).toBeUndefined()

    const nestedOrderedList = outerItems[1].content!.find(node => node.type === 'orderedList')
    expect(nestedOrderedList).toBeDefined()
    expect(nestedOrderedList!.content).toHaveLength(2)
  })

  it('converts a deeply nested (3-level) list hierarchy entirely', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, BulletList, OrderedList],
      content: `
        <ul>
          <li>
            <p>A</p>
            <ul>
              <li>
                <p>A-1</p>
                <ul>
                  <li><p>A-1-a</p></li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `,
    })

    editor.commands.selectAll()
    editor.commands.toggleOrderedList()

    const findAllListTypes = (node: any, acc: string[] = []): string[] => {
      if (node.type === 'bulletList' || node.type === 'orderedList') {
        acc.push(node.type)
      }
      ;(node.content || []).forEach((child: any) => findAllListTypes(child, acc))
      return acc
    }

    const json = editor.getJSON()
    const listTypes = findAllListTypes({ type: 'doc', content: json.content })

    expect(listTypes).toEqual(['orderedList', 'orderedList', 'orderedList'])
  })

  it('leaves a single-level list conversion working as before', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, BulletList, OrderedList],
      content: '<ul><li><p>One</p></li><li><p>Two</p></li></ul>',
    })

    editor.commands.selectAll()
    editor.commands.toggleOrderedList()

    const json = editor.getJSON()

    expect(json.content).toHaveLength(1)
    expect(json.content![0].type).toBe('orderedList')
    expect(json.content![0].content).toHaveLength(2)
  })
})

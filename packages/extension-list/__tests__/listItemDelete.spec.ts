import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { NodeSelection } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vitest'

import { BulletList, ListItem } from '../src/index.js'
import { hasBranchingNestedListAfterCursor } from '../src/helpers/hasBranchingNestedListAfterCursor.js'
import { hoistBranchingNestedList } from '../src/helpers/hoistBranchingNestedList.js'

const shallowNestedListContent = {
  type: 'doc',
  content: [
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Outer' }] },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Inner' }] }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

const branchingNestedListContent = {
  type: 'doc',
  content: [
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'Item 1.1' }] },
                    {
                      type: 'bulletList',
                      content: [
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Item 1.1.1' }],
                            },
                          ],
                        },
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Item 1.1.2' }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1.2' }] }],
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }],
        },
      ],
    },
  ],
}

const wrapperNames = ['bulletList', 'orderedList']

function findTextPosition(editor: Editor, text: string) {
  let position: number | null = null

  editor.state.doc.descendants((node, pos) => {
    if (position !== null) {
      return false
    }

    if (node.isText && node.text === text) {
      position = pos + node.text.length
    }
  })

  if (position === null) {
    throw new Error(`Could not find text position for "${text}"`)
  }

  return position
}

function dispatchDelete(editor: Editor) {
  return editor.view.someProp('handleKeyDown', f =>
    f(
      editor.view,
      new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }),
    ),
  )
}

describe('ListItem Delete with nested lists', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('hoists branching nested list via command', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, ListItem],
      content: branchingNestedListContent,
    })

    editor.commands.setTextSelection(findTextPosition(editor, 'Item 1'))

    const handled = hoistBranchingNestedList(
      editor.state,
      editor.view.dispatch,
      'listItem',
      wrapperNames,
    )

    expect(handled).toBe(true)
    expect(editor.getJSON().content?.[0]?.content).toHaveLength(4)
  })

  it('does not treat shallow nested lists as branching', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, ListItem],
      content: shallowNestedListContent,
    })

    editor.commands.setTextSelection(findTextPosition(editor, 'Outer'))

    expect(hasBranchingNestedListAfterCursor(editor.state, 'listItem', wrapperNames)).toBe(false)
    expect(hoistBranchingNestedList(editor.state, undefined, 'listItem', wrapperNames)).toBe(false)
  })

  it('hoists branching nested list items on Delete without node selection', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, ListItem],
      content: branchingNestedListContent,
    })

    editor.commands.setTextSelection(findTextPosition(editor, 'Item 1'))

    expect(dispatchDelete(editor)).toBe(true)
    expect(editor.state.selection).not.toBeInstanceOf(NodeSelection)

    const topList = editor.getJSON().content?.[0]

    expect(topList?.type).toBe('bulletList')
    expect(topList?.content).toHaveLength(4)

    const item1 = topList?.content?.[0]

    expect(item1?.type).toBe('listItem')
    expect(item1?.content).toHaveLength(1)
    expect(item1?.content?.[0]?.type).toBe('paragraph')

    expect(topList?.content?.[1]?.content?.[0]?.content?.[0]?.text).toBe('Item 1.1')
    expect(topList?.content?.[2]?.content?.[0]?.content?.[0]?.text).toBe('Item 1.2')
    expect(topList?.content?.[3]?.content?.[0]?.content?.[0]?.text).toBe('Item 2')
  })

  it('does not create node selection on a second Delete after hoisting', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, ListItem],
      content: branchingNestedListContent,
    })

    editor.commands.setTextSelection(findTextPosition(editor, 'Item 1'))

    dispatchDelete(editor)
    dispatchDelete(editor)

    expect(editor.state.selection).not.toBeInstanceOf(NodeSelection)

    const docText = JSON.stringify(editor.getJSON())

    expect(docText).toContain('Item 1.1')
    expect(docText).toContain('Item 1.2')
    expect(docText).toContain('Item 2')
    expect(editor.getJSON().content?.[0]?.content?.length).toBeGreaterThanOrEqual(3)
  })

  it('still allows joinForward for shallow nested lists when nested items are leaf nodes', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, ListItem],
      content: shallowNestedListContent,
    })

    editor.commands.setTextSelection(findTextPosition(editor, 'Outer'))

    expect(dispatchDelete(editor)).toBe(true)
    expect(editor.state.selection).not.toBeInstanceOf(NodeSelection)

    const docText = JSON.stringify(editor.getJSON())

    expect(docText).toContain('Outer')
    expect(docText).toContain('Inner')
  })
})

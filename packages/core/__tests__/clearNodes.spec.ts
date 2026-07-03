import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import BulletList from '@tiptap/extension-list/bullet-list'
import ListItem from '@tiptap/extension-list/item'
import { afterEach, describe, expect, it } from 'vitest'

// clearNodes() used to lift every non-text node found by nodesBetween in
// document order — including wrapper/container nodes like listItem, not
// just textblocks. Lifting an outer wrapper before its still-to-be-visited
// nested children were processed mutated the document mid-iteration and
// corrupted the mapped positions those later callbacks relied on. For a
// list nested two levels deep, this ejected the deepest paragraph out of
// the list entirely instead of flattening it alongside its siblings —
// outright content loss.
describe('clearNodes', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('does not drop content when clearing a doubly-nested list', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, BulletList],
      content: `
        <ul>
          <li>
            <p>Item 1</p>
            <ul>
              <li><p>Item 1-1</p></li>
            </ul>
          </li>
        </ul>
      `,
    })

    editor.commands.selectAll()
    editor.commands.clearNodes()

    expect(editor.getText()).toContain('Item 1')
    expect(editor.getText()).toContain('Item 1-1')
  })

  it('turns a simple textblock into a paragraph', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, BulletList],
      content: '<ul><li><p>Hello</p></li></ul>',
    })

    editor.commands.selectAll()
    editor.commands.clearNodes()

    const json = editor.getJSON()
    expect(json.content).toHaveLength(1)
    expect(json.content![0].type).toBe('paragraph')
    expect(editor.getText()).toBe('Hello')
  })
})

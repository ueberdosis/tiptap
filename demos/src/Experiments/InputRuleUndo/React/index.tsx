import { Extension, InputRule } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import { BulletList, ListItem } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import * as Y from 'yjs'

const document = new Y.Doc()

const CustomListInputRule = Extension.create({
  name: 'customListInputRule',

  addInputRules() {
    return [
      new InputRule({
        find: /^-\s$/,
        handler: ({ chain, range, state }) => {
          const $from = state.doc.resolve(range.from)

          chain()
            .setTextSelection({ from: $from.start(), to: $from.end() })
            .toggleBulletList()
            .command(({ tr }) => {
              tr.delete(tr.selection.from, tr.selection.from + 2)
              return true
            })
            .run()
        },
      }),
    ]
  },
})

export default function InputRuleUndo() {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      BulletList,
      ListItem,
      CustomListInputRule,
      Collaboration.configure({ document }),
    ],
  })

  return (
    <>
      <div className="control-group">
        <p>Type "- " at the start of the paragraph. Undo should restore the marker.</p>
        <div className="button-group">
          <button type="button" disabled={!editor} onClick={() => editor?.commands.undo()}>
            Undo
          </button>
          <button type="button" disabled={!editor} onClick={() => editor?.commands.redo()}>
            Redo
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}

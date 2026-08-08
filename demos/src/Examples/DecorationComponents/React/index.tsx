import '../styles.scss'

import { Extension } from '@tiptap/core'
import type { Decoration } from '@tiptap/core'
import UniqueID from '@tiptap/extension-unique-id'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, ReactWidgetRenderer, useEditor } from '@tiptap/react'

import { Counter } from './Counter.js'

/** Renders a Counter widget at the end of every paragraph using ReactWidgetRenderer. */
const ParagraphCounters = Extension.create({
  name: 'paragraphCounters',

  addDecorations() {
    return {
      create: ({ editor, state }) => {
        const decorations: Decoration[] = []
        let index = 0

        state.doc.forEach((node, offset) => {
          if (node.type.name !== 'paragraph') {
            return
          }

          const currentIndex = index

          decorations.push(
            ReactWidgetRenderer(Counter, {
              editor,
              pos: offset + node.nodeSize - 1,
              // uniqueID sets ids late, so id is null on the first render
              key: `paragraph-counter-${node.attrs.id ?? `pos-${offset}`}`,
              props: { index: currentIndex },
              side: 1,
            }),
          )

          index += 1
        })

        return decorations
      },
    }
  },
})

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, UniqueID.configure({ types: ['paragraph'] }), ParagraphCounters],
    content: `
      <h2>Decoration components</h2>
      <p>Each paragraph gets an interactive React widget. Click a counter, then type in this paragraph — the count survives because the widget instance is reused, not remounted.</p>
      <p>This second paragraph has its own independent counter. Add or remove paragraphs to see the indexes update.</p>
    `,
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}

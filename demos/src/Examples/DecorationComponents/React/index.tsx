import '../styles.scss'

import { Extension } from '@tiptap/core'
import type { DecorationDescriptor } from '@tiptap/core'
import UniqueID from '@tiptap/extension-unique-id'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, ReactWidgetRenderer, useEditor } from '@tiptap/react'

import { Counter } from './Counter.js'

/**
 * Renders an interactive React `Counter` widget at the end of every paragraph
 * using the declarative Decorations API + `ReactWidgetRenderer`.
 *
 * Widgets are keyed by the paragraph's stable `id` (assigned by `UniqueID`), not
 * by its index. That is what lets the counter keep its value when you type,
 * insert, or reorder paragraphs — ProseMirror reuses the same component instance
 * because the key is stable. An index-based key would churn on every structural
 * change and remount the component, losing its state.
 */
const ParagraphCounters = Extension.create({
  name: 'paragraphCounters',

  addDecorations() {
    return {
      create: ({ editor, state }) => {
        const decorations: DecorationDescriptor[] = []
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
              // Stable domain key: the paragraph's id, not its position/index.
              key: `paragraph-counter-${node.attrs.id}`,
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

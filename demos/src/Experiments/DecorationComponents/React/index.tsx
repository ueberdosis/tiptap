import '../styles.scss'

import { Extension } from '@tiptap/core'
import type { DecorationDescriptor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, ReactWidgetRenderer, useEditor } from '@tiptap/react'

import { Counter } from './Counter.js'

/**
 * Renders an interactive React `Counter` widget at the end of every paragraph
 * using the declarative Decorations API + `ReactWidgetRenderer`.
 *
 * Widgets are keyed by paragraph index, so typing inside a paragraph reuses the
 * same component instance (the counter keeps its value).
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
              key: `paragraph-counter-${currentIndex}`,
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
    extensions: [StarterKit, ParagraphCounters],
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

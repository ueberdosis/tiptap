import './styles.scss'

import { EditorContent, Extension, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

function findExampleWords(state) {
  const positions = []

  state.doc.descendants((node, pos) => {
    if (node.isText && node.text.includes('example')) {
      // find all occurrences of the word “example”, don't stop after the first
      for (let i = 0; i < node.text.length; i += 1) {
        if (node.text.substr(i).startsWith('example')) {
          positions.push(pos + i + 'example'.length)
        }
      }
    }
  })

  return positions
}

const ExampleDecorations = Extension.create({
  name: 'exampleDecorations',

  decorations: {
    create({ state }) {
      const positions = findExampleWords(state)

      return positions.map(pos => ({
        type: 'widget',
        from: pos,
        to: pos,
        attributes: {},
        widget: () => {
          const el = document.createElement('span')
          el.textContent = '🚀'
          return el
        },
      }))
    },
    update({ state }) {
      const positions = findExampleWords(state)

      return positions.map(pos => ({
        type: 'widget',
        from: pos,
        to: pos,
        attributes: {},
        widget: () => {
          const el = document.createElement('span')
          el.textContent = '🚀'
          return el
        },
      }))
    },
  },
})

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, ExampleDecorations],
    content: `
      <p>This is an example for the decorations API.</p>
    `,
  })

  return (
    <>
      <EditorContent editor={editor} />
    </>
  )
}

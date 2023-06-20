import './styles.scss'

import { Extension, NodePosition } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { useState } from 'react'

const edge = (isEnd, extraClass) => {
  const el = document.createElement('div')

  el.style.display = 'inline-block'
  el.style.height = '16px'
  el.classList.add('range-preview')
  el.style.pointerEvents = 'none'
  el.style.position = 'absolute'
  el.style.aspectRatio = '1 / 1'
  el.style.userSelect = 'none'

  if (isEnd) {
    el.style.transform = 'translateX(-100%)'
  }

  if (extraClass) {
    el.classList.add(extraClass)
  }

  return el
}

const RangePreview = Extension.create({
  name: 'rangePreview',

  addProseMirrorPlugins() {

    return [
      new Plugin({
        key: new PluginKey('rangePreview'),

        props: {
          decorations: ({ doc, selection }) => {
            const decorations = []

            const pos = new NodePosition(selection.$anchor)

            const startDecoration = Decoration.widget(pos.from + 1, edge(false))
            const endDecoration = Decoration.widget(pos.to - 1, edge(true))

            if (pos.parent) {
              decorations.push(Decoration.inline(pos.parent.from, pos.parent.to, { class: 'range-parent' }))
            }

            if (pos.before) {
              decorations.push(Decoration.widget(pos.before.from + 1, edge(false, 'range-preview__before')))
              decorations.push(Decoration.widget(pos.before.to - 1, edge(true, 'range-preview__before')))
            }

            if (pos.after) {
              decorations.push(Decoration.widget(pos.after.from + 1, edge(false, 'range-preview__after')))
              decorations.push(Decoration.widget(pos.after.to - 1, edge(true, 'range-preview__after')))
            }

            decorations.push(startDecoration)
            decorations.push(endDecoration)

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})

const content = `
  <h1>Hello World</h1>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus aliquid praesentium ducimus voluptate dolores, totam ratione esse tenetur nulla, distinctio recusandae qui. Aspernatur alias maxime optio veniam, voluptatibus aut dolores!</p>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus aliquid praesentium ducimus voluptate dolores, totam ratione esse tenetur nulla, distinctio recusandae qui. Aspernatur alias maxime optio veniam, voluptatibus aut dolores!</p>
  <hr />
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus aliquid praesentium ducimus voluptate dolores, totam ratione esse tenetur nulla, distinctio recusandae qui. Aspernatur alias maxime optio veniam, voluptatibus aut dolores!</p>
  <blockquote>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus aliquid praesentium ducimus voluptate dolores, totam ratione esse tenetur nulla, distinctio recusandae qui. Aspernatur alias maxime optio veniam, voluptatibus aut dolores!</p>
  </blockquote>
  <h2>Hello world</h2>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus aliquid praesentium ducimus voluptate dolores, totam ratione esse tenetur nulla, distinctio recusandae qui. Aspernatur alias maxime optio veniam, voluptatibus aut dolores!</p>
`

export default () => {
  const [nodePosition, setNodePosition] = useState(null)
  const [prev, setPrev] = useState(null)
  const [next, setNext] = useState(null)
  const [parent, setParent] = useState(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      RangePreview,
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => {
      const nodePos = new NodePosition(currentEditor.state.selection.$anchor)

      setNodePosition(nodePos)
      setPrev(nodePos.before)
      setNext(nodePos.after)
      setParent(nodePos.parent)
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      const nodePos = new NodePosition(currentEditor.state.selection.$anchor)

      setNodePosition(nodePos)
      setPrev(nodePos.before)
      setNext(nodePos.after)
      setParent(nodePos.parent)
    },
  })

  return (
    <div>
      <EditorContent editor={editor} />
      {prev && (
        <pre>
          <p>Prev:</p>
          <p>{prev.name} ({prev.from}, {prev.to})</p>
        </pre>
      )}
      {nodePosition && (
        <pre>
          <p>NodePosition:</p>
          <p>{nodePosition.name} ({nodePosition.from}, {nodePosition.to})</p>
        </pre>
      )}
      {next && (
        <pre>
          <p>Next:</p>
          <p>{next.name} ({next.from}, {next.to})</p>
        </pre>
      )}
      {parent && (
        <>
          <p>parent:</p>
          <pre>{JSON.stringify(parent)}</pre>
          <p>{parent.name} ({parent.from}, {parent.to})</p>
        </>
      )}
    </div>
  )
}

import './styles.scss'

import { useEditor, Tiptap } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

export default () => {
  const [mostRecentDeletion, setMostRecentDeletion] = React.useState<string | null>(null)
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <p>
        Try to delete this text.
      </p>
      `,
    onDelete({ node, transaction, newPos }) {
      const newNode = transaction.doc.nodeAt(newPos)
      setMostRecentDeletion(`${node.toString()} -> ${newNode?.toString()}`)
    },
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="hint">Most recent deletion: {mostRecentDeletion}</div>
      </div>
      <Tiptap instance={editor}>
        <Tiptap.Content />
      </Tiptap>
    </>
  )
}

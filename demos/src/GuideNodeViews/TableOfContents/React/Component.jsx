import React, { useState, useEffect, useCallback } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import './Component.scss'

export default ({ editor }) => {
  const [items, setItems] = useState([])

  const handleUpdate = useCallback(() => {
    const headings = []
    const transaction = editor.state.tr

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        const id = `heading-${headings.length + 1}`

        if (node.attrs.id !== id) {
          transaction.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            id,
          })
        }

        headings.push({
          level: node.attrs.level,
          text: node.textContent,
          id,
        })
      }
    })

    transaction.setMeta('preventUpdate', true)

    editor.view.dispatch(transaction)

    setItems(headings)
  }, [editor])

  useEffect(handleUpdate, [])

  useEffect(() => {
    if (!editor) {
      return null
    }

    editor.on('update', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor])

  return (
    <NodeViewWrapper className="toc">
      <ul className="toc__list">
        {items.map((item, index) => (
          <li key={index} className={`toc__item toc__item--${item.level}`}>
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ul>
    </NodeViewWrapper>
  )
}

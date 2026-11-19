import { Editor } from '@tiptap/core'
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useState } from 'react'

const content = `
  <details open>
    <summary>This details is open when it is created</summary>
    <p>Its content is part of the height right after the editor is created.</p>
  </details>
`

// Creates an editor on an attached element and measures it right away, with no timer in between.
const measureRightAfterCreation = openWithoutDelay => {
  const element = document.createElement('div')

  document.body.appendChild(element)

  const editor = new Editor({
    element,
    extensions: [
      StarterKit,
      Details.configure({
        persist: true,
        openWithoutDelay,
        HTMLAttributes: { class: 'details' },
      }),
      DetailsSummary,
      DetailsContent,
    ],
    content,
  })
  const details = editor.view.dom.querySelector('[data-type="details"]')
  const height = Math.round(details?.getBoundingClientRect().height ?? 0)

  editor.destroy()
  element.remove()

  return height
}

export default () => {
  const [heights, setHeights] = useState(null)

  useEffect(() => {
    setHeights({
      withDelay: measureRightAfterCreation(false),
      withoutDelay: measureRightAfterCreation(true),
    })
  }, [])

  if (!heights) {
    return null
  }

  return (
    <ul>
      <li>Height right after creation, default: {heights.withDelay}px</li>
      <li>Height right after creation, openWithoutDelay: {heights.withoutDelay}px</li>
    </ul>
  )
}

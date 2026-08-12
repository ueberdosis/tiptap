import './styles.scss'

import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React, { useState } from 'react'

import { PerfBlock, PerfTextContainer } from './BlockExtension.js'
import { selectorMode } from './selectorMode.js'

const BLOCK_COUNT = 1260

const buildContent = blockCount => ({
  type: 'doc',
  content: Array.from({ length: blockCount }, (_, index) => ({
    type: 'perfBlock',
    content: [
      {
        type: 'perfTextContainer',
        content: [{ type: 'text', text: `Block number ${index + 1}` }],
      },
    ],
  })),
})

/** Time from the interaction until the browser paints the next frame. */
const measureFrame = run => {
  const start = performance.now()

  run()

  return new Promise(resolve => {
    requestAnimationFrame(() => resolve(Math.round(performance.now() - start)))
  })
}

export default () => {
  const [result, setResult] = useState(null)
  const [dependsOnSelection, setDependsOnSelection] = useState(selectorMode.dependsOnSelection)

  const editor = useEditor({
    extensions: [Document, Text, PerfBlock, PerfTextContainer],
    content: buildContent(BLOCK_COUNT),
  })

  const measure = async (label, run) => {
    window.__selectorCalls = 0

    const duration = await measureFrame(run)

    setResult({
      label,
      duration,
      selectorCalls: window.__selectorCalls,
    })
  }

  if (!editor) {
    return null
  }

  const middleBlock = Math.floor(BLOCK_COUNT / 2)
  const middlePosition = () => {
    let position = 0

    editor.state.doc.forEach((node, offset, index) => {
      if (index === middleBlock) {
        position = offset
      }
    })

    return position
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() =>
              measure('cursor', () => editor.commands.setTextSelection(middlePosition() + 2))
            }
          >
            Move the cursor
          </button>
          <button
            onClick={() =>
              measure('node selection', () => editor.commands.setNodeSelection(middlePosition()))
            }
          >
            Select a block
          </button>
          <button
            onClick={() =>
              measure('typing', () => editor.commands.insertContentAt(middlePosition() + 2, 'a'))
            }
          >
            Insert a character
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={dependsOnSelection}
            onChange={event => {
              selectorMode.dependsOnSelection = event.target.checked
              setDependsOnSelection(event.target.checked)
            }}
          />
          Selectors depend on the selection
        </label>
      </div>

      <div className="output-group">
        <p>
          {BLOCK_COUNT} blocks, {BLOCK_COUNT * 2} React node views, each one with its own{' '}
          <code>useEditorState</code>.
        </p>
        {result && (
          <p data-testid="result">
            {result.label}: {result.duration}ms to the next frame, {result.selectorCalls} selector
            calls.
          </p>
        )}
      </div>

      <EditorContent editor={editor} />
    </>
  )
}

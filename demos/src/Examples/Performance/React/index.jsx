import './styles.scss'

import { useEditor, useEditorState, useTiptap, useTiptapState, Tiptap } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

const BubbleMenuContent = () => {
  const { editor } = useTiptap()
  const currentEditorState = useTiptapState({
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isStrike: ctx.editor.isActive('strike'),
    }),
    equalityFn: (prev, next) => {
      if (!next) {
        return false
      }
      return prev.isBold === next.isBold && prev.isItalic === next.isItalic && prev.isStrike === next.isStrike
    },
  })

  if (!currentEditorState) {
    return null
  }

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={currentEditorState.isBold ? 'is-active' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={currentEditorState.isItalic ? 'is-active' : ''}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={currentEditorState.isStrike ? 'is-active' : ''}
      >
        Strike
      </button>
    </>
  )
}

function EditorInstance({ shouldOptimizeRendering }) {
  const countRenderRef = React.useRef(0)

  countRenderRef.current += 1

  const editor = useEditor({
    /**
     * This option gives us the control to enable the default behavior of rendering the editor immediately.
     */
    immediatelyRender: true,
    /**
     * This option gives us the control to disable the default behavior of re-rendering the editor on every transaction.
     */
    shouldRerenderOnTransaction: !shouldOptimizeRendering,
    extensions: [StarterKit],
    content: `
    <p>
      A highly optimized editor that only re-renders when it's necessary.
    </p>
    `,
  })

  return (
    <div>
      <div className="control-group">
        <div>
          Number of renders: <span id="render-count">{countRenderRef.current}</span>
        </div>
      </div>
      <Tiptap instance={editor}>
        <Tiptap.BubbleMenu className="bubble-menu">
          <BubbleMenuContent />
        </Tiptap.BubbleMenu>
        <Tiptap.Content />
      </Tiptap>
    </div>
  )
}

const EditorControls = () => {
  const [shouldOptimizeRendering, setShouldOptimizeRendering] = React.useState(true)
  const [rendered, setRendered] = React.useState(true)

  return (
    <>
      <div className="control-group">
        <div className="switch-group">
          <label>
            <input
              type="radio"
              name="option-switch"
              onChange={() => {
                setShouldOptimizeRendering(true)
              }}
              checked={shouldOptimizeRendering === true}
            />
            Optimize rendering
          </label>
          <label>
            <input
              type="radio"
              name="option-switch"
              onChange={() => {
                setShouldOptimizeRendering(false)
              }}
              checked={shouldOptimizeRendering === false}
            />
            Render every transaction (default behavior)
          </label>
        </div>
        <button onClick={() => setRendered(a => !a)}>Toggle rendered</button>
      </div>
      {rendered && <EditorInstance shouldOptimizeRendering={shouldOptimizeRendering} />}
    </>
  )
}

export default () => {
  return (
    <React.StrictMode>
      <EditorControls />
    </React.StrictMode>
  )
}

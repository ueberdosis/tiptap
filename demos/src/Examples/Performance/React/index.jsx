import './styles.scss'

import {
  BubbleMenu, EditorContent, useEditor, useEditorState,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

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
      A highly optimized editor that only re-renders when it’s necessary.
    </p>
    `,
  })
  /**
   * This hook allows us to select the editor state we want to use in our component.
   */
  const currentEditorState = useEditorState({
    /**
     * The editor instance we want to use.
     */
    editor,
    /**
     * This selector allows us to select the data we want to use in our component.
     * It is evaluated on every editor transaction and compared to it's previously returned value.
     */
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isStrike: ctx.editor.isActive('strike'),
    }),
    /**
     * This function allows us to customize the equality check for the selector.
     * By default it is a `===` check.
     */
    equalityFn: (prev, next) => {
      // A deep-equal function would probably be more maintainable here, but, we use a shallow one to show that it can be customized.
      if (!next) {
        return false
      }
      return (
        prev.isBold === next.isBold
        && prev.isItalic === next.isItalic
        && prev.isStrike === next.isStrike
      )
    },
  })

  return (
    <div>
      <div className="control-group">
        <div>Number of renders: <span id="render-count">{countRenderRef.current}</span></div>
      </div>
      {currentEditorState && (
        <BubbleMenu className="bubble-menu" tippyOptions={{ duration: 100 }} editor={editor}>
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
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
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

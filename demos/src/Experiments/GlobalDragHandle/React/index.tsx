import './styles.scss'

import { DragHandle } from '@tiptap/extension-drag-handle'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'

const Editor = ({
  content,
  onUpdate,
  editable = true,
}: {
  content: string
  onUpdate: (content: string) => void
  editable?: boolean
}) => {
  // The key insight: ProseMirror's cross-editor drag handling in PasteRule.ts
  // automatically checks dragFromOtherEditor?.isEditable to decide whether to delete
  // So we just need to use the standard DragHandle and set editable correctly!

  const editor = useEditor({
    extensions: [StarterKit, DragHandle],
    content,
    editable,
    onUpdate: ({ editor: _editor }) => {
      onUpdate(_editor.getHTML())
    },
  })

  return (
    <div className={`editor-container ${!editable ? 'readonly' : ''}`}>
      <h3>{`Editor: ${editor.instanceId}`}</h3>
      <div className="editor-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default () => {
  const [content1, setContent1] = useState(`
    <h2>First Editor</h2>
    <p>This is the first editor. You can drag content between editors.</p>
    <ul>
      <li>List item 1</li>
      <li>List item 2</li>
    </ul>
    <blockquote>
      This is a blockquote that can be dragged.
    </blockquote>
  `)

  const [content2, setContent2] = useState(`
    <h2>Second Editor</h2>
    <p>This is the second editor. Try dragging content from the first editor here.</p>
    <pre><code>console.log('Hello, world!')</code></pre>
    <ol>
      <li>Ordered list item 1</li>
      <li>Ordered list item 2</li>
    </ol>
    <p><strong>Bold text</strong> and <em>italic text</em> can also be dragged.</p>
  `)

  // Editor configurations
  const editorConfigs = {
    editor1: { editable: true },
    editor2: { editable: true },
  }

  return (
    <div className="global-drag-handle-demo">
      <h1>Global Drag Handle - React Example</h1>
      <p>
        This example demonstrates a global drag handle that works across multiple editors. Hover over content in any
        editor to see the drag handle appear on the left. You can drag content between different editors.
      </p>
      <p>
        <strong>Behavior:</strong> Dragging moves content from the source editor to the target editor.
      </p>

      <div className="editors-container">
        <Editor content={content1} onUpdate={setContent1} editable={editorConfigs.editor1.editable} />
        <Editor content={content2} onUpdate={setContent2} editable={editorConfigs.editor2.editable} />
      </div>

      <div className="debug-info">
        <h3>Debug Information</h3>
        <details>
          <summary>Editor 1 Content</summary>
          <pre>{content1}</pre>
        </details>
        <details>
          <summary>Editor 2 Content</summary>
          <pre>{content2}</pre>
        </details>
      </div>
    </div>
  )
}

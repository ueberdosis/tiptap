import './styles.scss'

import {
  BubbleMenu, EditorContent, Node, NodeViewWrapper, ReactNodeViewRenderer, useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'

const CustomNodeView = () => {
  return (
    <NodeViewWrapper>
      <div contentEditable={false} style={{ float: 'left', aspectRatio: 1, backgroundColor: 'red' }}>This is my node view!</div>
    </NodeViewWrapper>
  )
}

const CustomNodeViewNode = Node.create({
  name: 'customNodeView',

  group: 'block',

  content: 'inline*',

  selectable: true,

  defining: true,

  atom: true,

  isolating: true,

  renderHTML() {
    return ['div', { class: 'custom-node-view' }, 0]
  },

  parseHTML() {
    return [
      {
        tag: 'div.custom-node-view',
      },
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CustomNodeView)
  },
})

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomNodeViewNode,
    ],
    content: `
      <div class="custom-node-view"></div>
      <p>
        Hey, try to select some text here. There will popup a menu for selecting some inline styles. Remember: you have full control about content and styling of this menu.
      </p>
      <div class="custom-node-view"></div>
      <div class="custom-node-view"></div>
      <p>
        Hey, try to select some text here. There will popup a menu for selecting some inline styles. Remember: you have full control about content and styling of this menu.
      </p>
      <div class="custom-node-view"></div>
      <div class="custom-node-view"></div>
    `,
  })

  const [isEditable, setIsEditable] = React.useState(true)

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable)
    }
  }, [isEditable, editor])

  return (
    <>
      <div>
        <input type="checkbox" checked={isEditable} onChange={() => setIsEditable(!isEditable)} />
        Editable
      </div>
      {editor && <BubbleMenu updateDelay={2000} editor={editor} tippyOptions={{ duration: 100 }}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          strike
        </button>
      </BubbleMenu>}
      <EditorContent editor={editor} />
    </>
  )
}

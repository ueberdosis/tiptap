import Paragraph from '@tiptap/extension-paragraph'
import {
  EditorContent,
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

const ParagraphView = () => (
  <NodeViewWrapper>
    <NodeViewContent as="p" />
  </NodeViewWrapper>
)

const ReactParagraph = Paragraph.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ParagraphView)
  },
})

export default () => {
  const editor = useEditor({
    extensions: [StarterKit.configure({ paragraph: false }), ReactParagraph],
    content: '<p>Second line of text here</p>',
  })

  return (
    <>
      <div className="output-group">
        On Android with Gboard, tap right after &quot;line&quot; and press Enter. The paragraph
        should split after &quot;line&quot; and keep &quot;of text here&quot; in the new paragraph.
      </div>
      <EditorContent editor={editor} />
    </>
  )
}

import './styles.scss'

import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { EditorContent, Node as NodeExtension, ResizableNodeview, useEditor } from '@dibdab/react'

const ResizableNode = NodeExtension.create({
  name: 'resizableNode',
  group: 'block',
  content: 'block+',
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      width: {
        default: 'auto',
      },
      height: {
        default: 'auto',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-resizer]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        'data-resizer': '',
        style: `width: ${HTMLAttributes.width}; height: ${HTMLAttributes.height}; border: 1px solid black; box-sizing: border-box;`,
      },
      0,
    ]
  },

  addNodeView() {
    return props => {
      const width = props.node.attrs.width
      const height = props.node.attrs.height

      const el = document.createElement('div')
      el.dataset.resizer = ''
      const content = document.createElement('div')
      content.innerText = `Width: ${width}, Height: ${height}`

      el.appendChild(content)

      el.style.width = width
      el.style.height = height

      const resizable = new ResizableNodeview({
        element: el,
        getPos: props.getPos,
        node: props.node,
        onCommit: (newWidth, newHeight) => {
          const pos = props.getPos()
          if (pos === undefined) {
            return
          }

          this.editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes(this.name, {
              width: newWidth,
              height: newHeight,
            })
            .run()
        },
        onResize: (newWidth, newHeight) => {
          content.innerText = `Width: ${newWidth}, Height: ${newHeight}`
        },
        onUpdate: () => false,
      })

      return resizable
    }
  },
})

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, ResizableNode],
    content: `
        <p>This is a resizable node demo.</p>
        <div data-resizer>
          <p>Test</p>
          <p>Test 2</p>
        </div>
        <div data-resizer width="800" height="500">
          <p>Test</p>
          <p>Test 2</p>
        </div>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <EditorContent editor={editor} />
    </>
  )
}

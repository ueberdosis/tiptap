import React, { useState, useEffect } from 'react'
import { defaultExtensions } from '@tiptap/starter-kit'
import Paragraph from '@tiptap/extension-paragraph'
import { Editor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import './styles.scss'
import { render, unmountComponentAtNode } from 'react-dom'

const useEditor = (options = {}) => {
  const [editor, setEditor] = useState(null)

  useEffect(() => {
    const instance = new Editor(options)
    setEditor(instance)

    return () => {
      instance.destroy()
    }
  }, [])

  return editor
}



function reactNodeView(Component) {
  const renderComponent = (props, dom) => render(<Component {...props} />, dom)

  return (node, view, getPos, decorations) => {
    let dom = document.createElement("div")
    renderComponent({ node, view, decorations, getPos }, dom)

    console.log(dom)
    return {
      dom,
      contentDOM: dom.querySelector('[data-node-view-content]'),
      update(node, decorations) {
        renderComponent({ node, view, decorations, getPos }, dom)
        return true
      },
      destroy() {
        unmountComponentAtNode(dom)
      },
    }
  }
}

export default () => {
  const editor = useEditor({
    content: '<p>hello react</p>',
    extensions: [
      ...defaultExtensions(),
      Paragraph.extend({
        addNodeView() {
          return reactNodeView(() => {
            // useEffect(() => {
            //   console.log('effect')
            // }, []);

            return (
              <p className="jooo" data-node-view-wrapper>
                <span data-node-view-content></span>
              </p>
            )
          })
          return ReactNodeViewRenderer(() => {
            // useEffect(() => {
            //   console.log('effect')
            // }, []);

            return (
              <p className="jooo" data-node-view-wrapper>
                <span data-node-view-content></span>
              </p>
            )
          })
        },
      }),
    ]
  })

  return (
    <EditorContent editor={editor} />
  )
}

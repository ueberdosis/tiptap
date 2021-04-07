import { Node, mergeAttributes } from '@tiptap/core'

export default Node.create({
  name: 'nodeView',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'node-view',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['node-view', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return () => {
      // Markup
      /*
        <div class="node-view">
          <span class="label">Node view</span>

          <div class="content"></div>
        </div>
      */

      const dom = document.createElement('div')
      dom.classList.add('node-view')

      const label = document.createElement('span')
      label.classList.add('label')
      label.innerHTML = 'Node view'
      label.contentEditable = false

      const content = document.createElement('div')
      content.classList.add('content')

      dom.append(label, content)

      return {
        dom,
        contentDOM: content,
      }
    }
  },
})

import { Node, mergeAttributes } from '@tiptap/core'

export default Node.create({
  name: 'nodeView',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      count: {
        default: 0,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'node-view',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['node-view', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ({ editor, node, getPos }) => {
      const { view } = editor

      // Markup
      /*
        <div class="node-view">
          <span class="label">Node view</span>

          <div class="content">
            <button>
              This button has been clicked ${node.attrs.count} times.
            </button>
          </div>
        </div>
      */

      const dom = document.createElement('div')
      dom.classList.add('node-view')

      const label = document.createElement('span')
      label.classList.add('label')
      label.innerHTML = 'Node view'

      const content = document.createElement('div')
      content.classList.add('content')

      const button = document.createElement('button')
      button.innerHTML = `This button has been clicked ${node.attrs.count} times.`
      button.addEventListener('click', () => {
        if (typeof getPos === 'function') {
          view.dispatch(view.state.tr.setNodeMarkup(getPos(), undefined, {
            count: node.attrs.count + 1,
          }))

          editor.commands.focus()
        }
      })
      content.append(button)

      dom.append(label, content)

      return {
        dom,
      }
    }
  },
})

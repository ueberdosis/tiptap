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
    return ({
      editor, node, getPos, HTMLAttributes, decorations, extension,
    }) => {
      const dom = document.createElement('div')
      dom.classList.add('node-view')

      const label = document.createElement('span')
      label.classList.add('label')
      label.innerHTML = 'Node View'

      const content = document.createElement('div')
      content.classList.add('content')
      content.innerHTML = 'I’m rendered with JavaScript.'

      dom.append(label, content)

      return {
        dom,
      }
    }
  },
})

// <node-view-wrapper class="vue-component">
//     <span class="label">Vue Component</span>

//     <div class="content">
//       <button @click="increase">
//         This button has been clicked {{ node.attrs.count }} times.
//       </button>
//     </div>
//   </node-view-wrapper>

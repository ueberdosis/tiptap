<template>
  <div v-if="editor" class="container">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent, Node as NodeExtension, ResizableNodeview } from '@tiptap/vue-3'

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

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  methods: {
    addImage() {
      const url = window.prompt('URL')

      if (url) {
        this.editor.chain().focus().setImage({ src: url }).run()
      }
    },
  },

  mounted() {
    this.editor = new Editor({
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
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  [data-resizer] {
    background-color: #f0f0f0;
  }

  [data-resize-handle] {
    position: absolute;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    z-index: 10;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    /* Corner handles */
    &[data-resize-handle='top-left'],
    &[data-resize-handle='top-right'],
    &[data-resize-handle='bottom-left'],
    &[data-resize-handle='bottom-right'] {
      width: 8px;
      height: 8px;
    }

    &[data-resize-handle='top-left'] {
      top: -4px;
      left: -4px;
      cursor: nwse-resize;
    }

    &[data-resize-handle='top-right'] {
      top: -4px;
      right: -4px;
      cursor: nesw-resize;
    }

    &[data-resize-handle='bottom-left'] {
      bottom: -4px;
      left: -4px;
      cursor: nesw-resize;
    }

    &[data-resize-handle='bottom-right'] {
      bottom: -4px;
      right: -4px;
      cursor: nwse-resize;
    }

    /* Edge handles */
    &[data-resize-handle='top'],
    &[data-resize-handle='bottom'] {
      height: 6px;
      left: 8px;
      right: 8px;
    }

    &[data-resize-handle='top'] {
      top: -3px;
      cursor: ns-resize;
    }

    &[data-resize-handle='bottom'] {
      bottom: -3px;
      cursor: ns-resize;
    }

    &[data-resize-handle='left'],
    &[data-resize-handle='right'] {
      width: 6px;
      top: 8px;
      bottom: 8px;
    }

    &[data-resize-handle='left'] {
      left: -3px;
      cursor: ew-resize;
    }

    &[data-resize-handle='right'] {
      right: -3px;
      cursor: ew-resize;
    }
  }

  [data-resize-state='true'] [data-resize-wrapper] {
    outline: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 0.125rem;
  }
}
</style>

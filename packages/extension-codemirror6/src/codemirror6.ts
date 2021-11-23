import { Node, NodeViewRendererProps } from '@tiptap/core'
import { CodeMirror6NodeView } from './codemirror6-node-view'
import { arrowHandler } from './codemirror6-utils'

export interface CodeMirror6Options {}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeMirror6: {
      /**
       * Set a codeMirror6 block
       */
      setCodeMirror6: (attributes?: { language: string }) => ReturnType;
      /**
       * Toggle a codeMirror6 block
       */
      toggleCodeMirror6: (attributes?: { language: string }) => ReturnType;
    };
  }
}

export const CodeMirror6 = Node.create<CodeMirror6Options>({
  name: 'codeMirror6',

  content: 'text*',

  marks: '',

  group: 'block',

  code: true,

  defining: true,

  addAttributes() {
    return {}
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', ['code', HTMLAttributes, 0]]
  },

  addCommands() {
    return {
      setCodeMirror6:
        attributes => ({ commands }) => {
          return commands.setNode('codeMirror6', attributes)
        },
      toggleCodeMirror6:
        attributes => ({ commands }) => {
          return commands.toggleNode('codeMirror6', 'paragraph', attributes)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      ArrowLeft: arrowHandler('left'),
      ArrowRight: arrowHandler('right'),
      ArrowUp: arrowHandler('up'),
      ArrowDown: arrowHandler('down'),
    }
  },

  addNodeView() {
    return (props: NodeViewRendererProps) => {
      return new CodeMirror6NodeView({
        node: props.node,
        getPos: props.getPos as () => number,
        view: props.editor.view,
      })
    }
  },
})

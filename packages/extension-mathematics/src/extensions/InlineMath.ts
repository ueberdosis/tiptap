import { InputRule, mergeAttributes, Node } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import katex from 'katex'

export type InlineMathOptions = {
  onClick?: (node: PMNode, pos: number) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineMath: {
      /**
       * Insert a inline math node with LaTeX string. If no latex string is given, the current selection will be transformed into a inline math node
       * @param options - Options for inserting inline math.
       * @returns ReturnType
       */
      insertInlineMath: (options: { latex?: string; pos?: number }) => ReturnType

      /**
       * Delete an inline math node.
       * @returns ReturnType
       */
      deleteInlineMath: (options?: { pos?: number }) => ReturnType

      /**
       * Update inline math node with optional LaTeX string.
       * @param options - Options for updating inline math.
       * @returns ReturnType
       */
      updateInlineMath: (options?: { latex?: string; pos?: number }) => ReturnType
    }
  }
}

/**
 * InlineMath is a Tiptap extension for rendering inline mathematical expressions using KaTeX.
 * It allows users to insert LaTeX formatted math expressions inline within text.
 * It supports rendering, input rules for LaTeX syntax, and click handling for interaction.
 *
 * @example
 * ```javascript
 * import { InlineMath } from '@tiptap/extension-mathematics'
 * import { Editor } from '@tiptap/core'
 *
 * const editor = new Editor({
 *   extensions: [
 *     InlineMath.configure({
 *       onClick: (node, pos) => {
 *         console.log('Inline math clicked:', node.attrs.latex, 'at position:', pos)
 *       },
 *     }),
 *   ],
 * })
 */
export const InlineMath = Node.create<InlineMathOptions>({
  name: 'inlineMath',

  group: 'inline',

  inline: true,

  atom: true,

  addOptions() {
    return {
      onClick: undefined,
    }
  },

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: element => element.getAttribute('data-latex'),
        renderHTML: attributes => {
          return {
            'data-latex': attributes.latex,
          }
        },
      },
    }
  },

  addCommands() {
    return {
      insertInlineMath:
        options =>
        ({ editor, tr }) => {
          const latex = options?.latex

          const from = options?.pos ?? editor.state.selection.from
          const to = options?.pos ?? editor.state.selection.to

          if (!latex && editor.state.selection.empty) {
            return false
          }

          const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)

          tr.replaceWith(from, to, this.type.create({ latex: latex && latex.length > 0 ? latex : selectedText.trim() }))
          return true
        },

      deleteInlineMath:
        options =>
        ({ editor, tr }) => {
          const pos = options?.pos ?? editor.state.selection.$from.pos
          const node = editor.state.doc.nodeAt(pos)

          if (!node || node.type.name !== this.name) {
            return false
          }

          tr.delete(pos, pos + node.nodeSize)
          return true
        },

      updateInlineMath:
        options =>
        ({ editor, tr }) => {
          const latex = options?.latex
          let pos = options?.pos

          if (pos === undefined) {
            pos = editor.state.selection.$from.pos
          }

          const node = editor.state.doc.nodeAt(pos)

          if (!node || node.type.name !== this.name) {
            return false
          }

          tr.setNodeMarkup(pos, this.type, { ...node.attrs, latex })

          return true
        },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="inline-math"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-math' })]
  },

  addInputRules() {
    return [
      new InputRule({
        find: /(?<!\$)\$\$([^$\n]+)\$\$(?!\$)$/,
        handler: ({ state, range, match }) => {
          const [, latex] = match
          const { tr } = state
          const start = range.from
          const end = range.to

          tr.replaceWith(start, end, this.type.create({ latex }))
        },
      }),
    ]
  },

  addNodeView() {
    return ({ node, getPos }) => {
      const wrapper = document.createElement('span')
      wrapper.className = 'tiptap-mathematics-render tiptap-mathematics-render--editable'
      wrapper.dataset.type = 'inline-math'
      wrapper.setAttribute('data-latex', node.attrs.latex)

      function renderMath() {
        try {
          katex.render(node.attrs.latex, wrapper)
          wrapper.classList.remove('inline-math-error')
        } catch {
          wrapper.textContent = node.attrs.latex
          wrapper.classList.add('inline-math-error')
        }
      }

      const handleClick = (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        const pos = getPos()

        if (pos == null) {
          return
        }

        if (this.options.onClick) {
          this.options.onClick(node, pos)
        }
      }

      if (this.options.onClick) {
        wrapper.addEventListener('click', handleClick)
      }

      renderMath()

      return {
        dom: wrapper,
        destroy() {
          wrapper.removeEventListener('click', handleClick)
        },
      }
    }
  },
})

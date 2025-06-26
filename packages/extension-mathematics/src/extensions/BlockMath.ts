import { InputRule, mergeAttributes, Node } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import katex from 'katex'

export type BlockMathOptions = {
  onClick?: (node: PMNode, pos: number) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockMath: {
      /**
       * Set block math node with LaTeX string.
       * @param options - Options for setting block math.
       * @returns ReturnType
       */
      setBlockMath: (options: { latex: string; pos?: number }) => ReturnType

      /**
       * Unset block math node.
       * @returns ReturnType
       */
      unsetBlockMath: (options?: { pos?: number }) => ReturnType

      /**
       * Update block math node with optional LaTeX string.
       * @param options - Options for updating block math.
       * @returns ReturnType
       */
      updateBlockMath: (options?: { latex?: string; pos?: number }) => ReturnType
    }
  }
}

/**
 * BlockMath is a Tiptap extension for rendering block mathematical expressions using KaTeX.
 * It allows users to insert LaTeX formatted math expressions block within text.
 * It supports rendering, input rules for LaTeX syntax, and click handling for interaction.
 *
 * @example
 * ```javascript
 * import { BlockMath } from 'your-extension-path'
 * import { Editor } from '@tiptap/core'
 *
 * const editor = new Editor({
 *   extensions: [
 *     BlockMath.configure({
 *       onClick: (node, pos) => {
 *         console.log('Block math clicked:', node.attrs.latex, 'at position:', pos)
 *       },
 *     }),
 *   ],
 * })
 */
export const BlockMath = Node.create({
  name: 'blockMath',

  group: 'block',

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
      setBlockMath:
        options =>
        ({ commands, editor }) => {
          const { latex, pos } = options
          return commands.insertContentAt(pos ?? editor.state.selection.from, {
            type: this.name,
            attrs: { latex },
          })
        },

      unsetBlockMath:
        options =>
        ({ editor, tr }) => {
          const pos = options?.pos ?? editor.state.selection.$from.pos
          const node = this.editor.state.doc.nodeAt(pos)

          if (!node || node.type.name !== this.name) {
            return false
          }

          tr.delete(pos, pos + node.nodeSize)
          return true
        },

      updateBlockMath:
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

          tr.setNodeMarkup(pos, this.type, {
            ...node.attrs,
            latex: latex || node.attrs.latex,
          })

          return true
        },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="block-math"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'block-math' })]
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^\$\$\$([^$]+)\$\$\$$/,
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
      const wrapper = document.createElement('div')
      const innerWrapper = document.createElement('div')
      wrapper.className = 'Tiptap-mathematics-render Tiptap-mathematics-render--editable'
      innerWrapper.className = 'block-math-inner'
      wrapper.dataset.type = 'block-math'
      wrapper.setAttribute('data-latex', node.attrs.latex)
      wrapper.appendChild(innerWrapper)

      function renderMath() {
        try {
          katex.render(node.attrs.latex, innerWrapper)
          wrapper.classList.remove('block-math-error')
        } catch {
          wrapper.textContent = node.attrs.latex
          wrapper.classList.add('block-math-error')
        }
      }

      const handleClick = (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        const pos = getPos()

        if (!pos) {
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

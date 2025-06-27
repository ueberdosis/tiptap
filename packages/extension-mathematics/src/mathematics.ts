import { Extension } from '@tiptap/core'

import { BlockMath, InlineMath } from './extensions/index.js'
import type { MathematicsOptions } from './types.js'

/**
 * Mathematics extension for Tiptap that provides both inline and block math support using KaTeX.
 * This extension combines the InlineMath and BlockMath extensions to provide a complete
 * mathematical expression solution for rich text editing. It supports LaTeX syntax,
 * custom rendering options, and interactive math nodes.
 *
 * @example
 * ```typescript
 * import { Editor } from '@tiptap/core'
 * import { Mathematics } from '@tiptap/extension-mathematics'
 * import { migrateMathStrings } from '@tiptap/extension-mathematics/utils'
 *
 * const editor = new Editor({
 *   extensions: [
 *     Mathematics.configure({
 *       inlineOptions: {
 *         onClick: (node, pos) => {
 *           console.log('Inline math clicked:', node.attrs.latex)
 *         }
 *       },
 *       blockOptions: {
 *         onClick: (node, pos) => {
 *           console.log('Block math clicked:', node.attrs.latex)
 *         }
 *       },
 *       katexOptions: {
 *         displayMode: false,
 *         throwOnError: false,
 *         macros: {
 *           '\\RR': '\\mathbb{R}',
 *           '\\ZZ': '\\mathbb{Z}'
 *         }
 *       }
 *     })
 *   ],
 *   content: `
 *     <p>Inline math: $E = mc^2$</p>
 *     <div data-type="block-math" data-latex="\\sum_{i=1}^{n} x_i = X"></div>
 *   `,
 *   onCreate({ editor }) {
 *     // Optional: Migrate existing math strings to math nodes
 *     migrateMathStrings(editor)
 *   }
 * })
 * ```
 */
export const Mathematics = Extension.create<MathematicsOptions>({
  name: 'Mathematics',

  addOptions() {
    return {
      inlineOptions: undefined,
      blockOptions: undefined,
      katexOptions: undefined,
    }
  },

  addExtensions() {
    return [BlockMath.configure(this.options.blockOptions), InlineMath.configure(this.options.inlineOptions)]
  },
})

export default Mathematics

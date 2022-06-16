import { findChildren } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export type Direction = 'ltr' | 'rtl';

const RTL = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC'

const LTR = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6'
  + '\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u200E\u2C00-\uFB1C'
  + '\uFE00-\uFE6F\uFEFD-\uFFFF'

// eslint-disable-next-line no-misleading-character-class
export const RTL_REGEX = new RegExp(`^[^${LTR}]*[${RTL}]`)

// eslint-disable-next-line no-misleading-character-class
export const LTR_REGEX = new RegExp(`^[^${RTL}]*[${LTR}]`)

export function getTextDirection(text: string): Direction | null {
  if (RTL_REGEX.test(text)) {
    return 'rtl'
  }
  if (LTR_REGEX.test(text)) {
    return 'ltr'
  }
  return null
}

export function DirectionPlugin({
  types,
  defaultDirection,
}: {
  types: string[];
  defaultDirection?: Direction | null;
}) {
  return new Plugin({
    key: new PluginKey('textDirection'),
    appendTransaction: (transactions, _oldState, newState) => {
      const tr = newState.tr
      let modified = false

      if (transactions.some(transaction => transaction.docChanged)) {
        const nodes = findChildren(newState.doc, node => types.includes(node.type.name))

        nodes.forEach(block => {
          const { node, pos } = block
          const { attrs, textContent } = node

          // don't add the `dir` attribute for nodes that already have one
          // so we can change/force the direction of a node without automatic
          // direction detection being involved.
          if (Boolean(attrs && attrs.dir) && textContent.length !== 0) {
            return
          }

          const dir = getTextDirection(textContent)

          tr.setNodeMarkup(pos, undefined, {
            ...attrs,
            dir: dir === defaultDirection ? null : dir,
          })

          modified = true
        })
      }

      return modified ? tr : null
    },
  })
}

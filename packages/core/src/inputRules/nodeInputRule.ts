import { NodeType } from '@tiptap/pm/model'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'

import { InputRule, InputRuleFinder } from '../InputRule.js'
import { ExtendedRegExpMatchArray } from '../types.js'
import { callOrReturn } from '../utilities/callOrReturn.js'

/**
 * Build an input rule that adds a node when the
 * matched text is typed into it.
 */
export function nodeInputRule(config: {
  /**
   * The regex to match.
   */
  find: InputRuleFinder

  /**
   * The node type to add.
   */
  type: NodeType

  /**
   * Should the input rule replace the node or append to it
   * If true, the node will be replaced
   */
  blockReplace?: boolean

  /**
   * Insert empty paragraph after inserting the node
   * Only works if blockReplace is true
   */
  addExtraNewline?: boolean

  /**
   * A function that returns the attributes for the node
   * can also be an object of attributes
   */
  getAttributes?:
    | Record<string, any>
    | ((match: ExtendedRegExpMatchArray) => Record<string, any>)
    | false
    | null
}) {
  return new InputRule({
    find: config.find,
    handler: ({ state, range, match }) => {
      const attributes = callOrReturn(config.getAttributes, undefined, match) || {}
      const { tr } = state
      const start = config.blockReplace ? range.from - 1 : range.from
      let end = range.to

      const newNode = config.type.create(attributes)

      const { $to } = tr.selection

      if (match[1]) {
        const offset = match[0].lastIndexOf(match[1])
        let matchStart = start + offset

        if (matchStart > end) {
          matchStart = end
        } else {
          end = matchStart + match[1].length
        }

        // insert last typed character
        const lastChar = match[0][match[0].length - 1]

        tr.insertText(lastChar, start + match[0].length - 1)

        // insert node from input rule
        tr.replaceWith(matchStart, end, newNode)
      } else if (match[0]) {
        tr.replaceWith(start, end, newNode)
      }

      if (config.blockReplace && config.addExtraNewline) {
        const posAfter = $to.end()

        if ($to.nodeAfter) {
          console.log($to.node().type.name)
          if ($to.nodeAfter.isTextblock) {
            tr.setSelection(TextSelection.create(tr.doc, $to.pos + 1))
          } else if ($to.nodeAfter.isBlock) {
            tr.setSelection(NodeSelection.create(tr.doc, $to.pos))
          } else {
            tr.setSelection(TextSelection.create(tr.doc, $to.pos))
          }
        } else {
          // add node after horizontal rule if it’s the end of the document
          const node = $to.parent.type.contentMatch.defaultType?.create()

          if (node) {
            tr.insert(posAfter, node)
            tr.setSelection(TextSelection.create(tr.doc, posAfter + 1))
          }
        }

        tr.scrollIntoView()
      }
    },
  })
}

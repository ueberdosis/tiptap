import type { Node as ProseMirrorNode, NodeType } from '@tiptap/pm/model'
import { canJoin, findWrapping } from '@tiptap/pm/transform'

import type { Editor } from '../Editor.js'
import type { InputRuleFinder } from '../InputRule.js'
import { InputRule } from '../InputRule.js'
import type { ExtendedRegExpMatchArray } from '../types.js'
import { callOrReturn } from '../utilities/callOrReturn.js'

/**
 * Build an input rule for automatically wrapping a textblock when a
 * given string is typed. When using a regular expresion you’ll
 * probably want the regexp to start with `^`, so that the pattern can
 * only occur at the start of a textblock.
 *
 * `type` is the type of node to wrap in.
 *
 * By default, if there’s a node with the same type above the newly
 * wrapped node, the rule will try to join those
 * two nodes. You can pass a join predicate, which takes a regular
 * expression match and the node before the wrapped node, and can
 * return a boolean to indicate whether a join should happen.
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing#input-rules
 */
export function wrappingInputRule(config: {
  find: InputRuleFinder
  type: NodeType
  keepMarks?: boolean
  keepAttributes?: boolean
  editor?: Editor
  getAttributes?: Record<string, any> | ((match: ExtendedRegExpMatchArray) => Record<string, any>) | false | null
  joinPredicate?: (match: ExtendedRegExpMatchArray, node: ProseMirrorNode) => boolean
}) {
  return new InputRule({
    find: config.find,
    handler: ({ state, range, match, chain }) => {
      const attributes = callOrReturn(config.getAttributes, undefined, match) || {}
      const tr = state.tr.delete(range.from, range.to)
      const $start = tr.doc.resolve(range.from)
      const blockRange = $start.blockRange()
      const wrapping = blockRange && findWrapping(blockRange, config.type, attributes)

      if (!wrapping) {
        return null
      }

      tr.wrap(blockRange, wrapping)

      if (config.keepMarks && config.editor) {
        const { selection, storedMarks } = state
        const { splittableMarks } = config.editor.extensionManager
        const marks = storedMarks || (selection.$to.parentOffset && selection.$from.marks())

        if (marks) {
          const filteredMarks = marks.filter(mark => splittableMarks.includes(mark.type.name))

          tr.ensureMarks(filteredMarks)
        }
      }
      if (config.keepAttributes) {
        /** If the nodeType is `bulletList` or `orderedList` set the `nodeType` as `listItem` */
        const nodeType =
          config.type.name === 'bulletList' || config.type.name === 'orderedList' ? 'listItem' : 'taskList'

        chain().updateAttributes(nodeType, attributes).run()
      }

      const before = tr.doc.resolve(range.from - 1).nodeBefore

      if (
        before &&
        before.type === config.type &&
        canJoin(tr.doc, range.from - 1) &&
        (!config.joinPredicate || config.joinPredicate(match, before))
      ) {
        tr.join(range.from - 1)
      }
    },
  })
}

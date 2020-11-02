import { wrapInList, liftListItem } from 'prosemirror-schema-list'
import { findParentNode } from 'prosemirror-utils'
import { NodeType } from 'prosemirror-model'
import { Command } from '../Editor'
import { createExtension } from '../Extension'
import getNodeType from '../utils/getNodeType'
import isList from '../utils/isList'

export const ToggleList = createExtension({
  addCommands() {
    return {
      toggleList: (listTypeOrName: string | NodeType, itemTypeOrName: string | NodeType): Command => ({
        tr, state, dispatch, chain,
      }) => {
        const { extensions } = this.editor.options
        const listType = getNodeType(listTypeOrName, state.schema)
        const itemType = getNodeType(itemTypeOrName, state.schema)
        const { selection } = state
        const { $from, $to } = selection
        const range = $from.blockRange($to)

        if (!range) {
          return false
        }

        const parentList = findParentNode(node => isList(node.type.name, extensions))(selection)

        if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
          // remove list
          if (parentList.node.type === listType) {
            return liftListItem(itemType)(state, dispatch)
          }

          // change list type
          if (isList(parentList.node.type.name, extensions) && listType.validContent(parentList.node.content)) {
            tr.setNodeMarkup(parentList.pos, listType)

            return false
          }
        }

        const canWrapInList = wrapInList(listType)(state)

        // try to convert node to paragraph if needed
        if (!canWrapInList) {
          return chain()
            // .setBlockType('paragraph')
            .clearNodes()
            .wrapInList(listType)
            .run()
        }

        return wrapInList(listType)(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    ToggleList: typeof ToggleList,
  }
}

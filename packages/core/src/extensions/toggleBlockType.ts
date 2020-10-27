import { NodeType } from 'prosemirror-model'
import { Command } from '../Editor'
import { createExtension } from '../Extension'
import nodeIsActive from '../utils/nodeIsActive'
import getNodeType from '../utils/getNodeType'

export const ToggleBlockType = createExtension({
  addCommands() {
    return {
      toggleBlockType: (typeOrName: string | NodeType, toggleTypeOrName: string | NodeType, attrs = {}): Command => ({ state, commands }) => {
        const type = getNodeType(typeOrName, state.schema)
        const toggleType = getNodeType(toggleTypeOrName, state.schema)
        const isActive = nodeIsActive(state, type, attrs)

        if (isActive) {
          return commands.setBlockType(toggleType)
        }

        return commands.setBlockType(type, attrs)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    ToggleBlockType: typeof ToggleBlockType,
  }
}

import { Extension } from '../Extension'
import * as blur from '../commands/blur'
import * as clearContent from '../commands/clearContent'
import * as command from '../commands/command'
import * as clearNodes from '../commands/clearNodes'
import * as deleteSelection from '../commands/deleteSelection'
import * as extendMarkRange from '../commands/extendMarkRange'
import * as first from '../commands/first'
import * as focus from '../commands/focus'
import * as insertHTML from '../commands/insertHTML'
import * as insertText from '../commands/insertText'
import * as lift from '../commands/lift'
import * as liftListItem from '../commands/liftListItem'
import * as removeMarks from '../commands/removeMarks'
import * as resetNodeAttributes from '../commands/resetNodeAttributes'
import * as scrollIntoView from '../commands/scrollIntoView'
import * as selectAll from '../commands/selectAll'
import * as selectParentNode from '../commands/selectParentNode'
import * as setBlockType from '../commands/setBlockType'
import * as setContent from '../commands/setContent'
import * as setMark from '../commands/setMark'
import * as sinkListItem from '../commands/sinkListItem'
import * as splitBlock from '../commands/splitBlock'
import * as splitListItem from '../commands/splitListItem'
import * as toggleBlockType from '../commands/toggleBlockType'
import * as toggleList from '../commands/toggleList'
import * as toggleMark from '../commands/toggleMark'
import * as toggleWrap from '../commands/toggleWrap'
import * as unsetMark from '../commands/unsetMark'
import * as updateNodeAttributes from '../commands/updateNodeAttributes'
import * as wrapIn from '../commands/wrapIn'
import * as wrapInList from '../commands/wrapInList'

export const Commands = Extension.create({
  addCommands() {
    return {
      ...blur,
      ...clearContent,
      ...clearNodes,
      ...command,
      ...deleteSelection,
      ...extendMarkRange,
      ...first,
      ...focus,
      ...insertHTML,
      ...insertText,
      ...lift,
      ...liftListItem,
      ...removeMarks,
      ...resetNodeAttributes,
      ...scrollIntoView,
      ...selectAll,
      ...selectParentNode,
      ...setBlockType,
      ...setContent,
      ...setMark,
      ...sinkListItem,
      ...splitBlock,
      ...splitListItem,
      ...toggleBlockType,
      ...toggleList,
      ...toggleMark,
      ...toggleWrap,
      ...unsetMark,
      ...updateNodeAttributes,
      ...wrapIn,
      ...wrapInList,
    }
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Commands: typeof Commands,
  }
}

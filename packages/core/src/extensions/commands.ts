import { Extension } from '../Extension'
import * as blur from '../commands/blur'
import * as clearContent from '../commands/clearContent'
import * as clearNodes from '../commands/clearNodes'
import * as command from '../commands/command'
import * as createParagraphNear from '../commands/createParagraphNear'
import * as deleteSelection from '../commands/deleteSelection'
import * as exitCode from '../commands/exitCode'
import * as extendMarkRange from '../commands/extendMarkRange'
import * as first from '../commands/first'
import * as focus from '../commands/focus'
import * as insertHTML from '../commands/insertHTML'
import * as insertText from '../commands/insertText'
import * as joinBackward from '../commands/joinBackward'
import * as joinForward from '../commands/joinForward'
import * as lift from '../commands/lift'
import * as liftEmptyBlock from '../commands/liftEmptyBlock'
import * as liftListItem from '../commands/liftListItem'
import * as newlineInCode from '../commands/newlineInCode'
import * as replace from '../commands/replace'
import * as replaceRange from '../commands/replaceRange'
import * as resetNodeAttributes from '../commands/resetNodeAttributes'
import * as scrollIntoView from '../commands/scrollIntoView'
import * as selectAll from '../commands/selectAll'
import * as selectNodeBackward from '../commands/selectNodeBackward'
import * as selectNodeForward from '../commands/selectNodeForward'
import * as selectParentNode from '../commands/selectParentNode'
import * as setContent from '../commands/setContent'
import * as setMark from '../commands/setMark'
import * as setNode from '../commands/setNode'
import * as sinkListItem from '../commands/sinkListItem'
import * as splitBlock from '../commands/splitBlock'
import * as splitListItem from '../commands/splitListItem'
import * as toggleList from '../commands/toggleList'
import * as toggleMark from '../commands/toggleMark'
import * as toggleNode from '../commands/toggleNode'
import * as toggleWrap from '../commands/toggleWrap'
import * as undoInputRule from '../commands/undoInputRule'
import * as unsetAllMarks from '../commands/unsetAllMarks'
import * as unsetMark from '../commands/unsetMark'
import * as updateNodeAttributes from '../commands/updateNodeAttributes'
import * as wrapIn from '../commands/wrapIn'
import * as wrapInList from '../commands/wrapInList'

export const Commands = Extension.create({
  name: 'commands',

  addCommands() {
    return {
      ...blur,
      ...clearContent,
      ...clearNodes,
      ...command,
      ...createParagraphNear,
      ...deleteSelection,
      ...exitCode,
      ...extendMarkRange,
      ...first,
      ...focus,
      ...insertHTML,
      ...insertText,
      ...joinBackward,
      ...joinForward,
      ...lift,
      ...liftEmptyBlock,
      ...liftListItem,
      ...newlineInCode,
      ...replace,
      ...replaceRange,
      ...resetNodeAttributes,
      ...scrollIntoView,
      ...selectAll,
      ...selectNodeBackward,
      ...selectNodeForward,
      ...selectParentNode,
      ...setContent,
      ...setMark,
      ...setNode,
      ...sinkListItem,
      ...splitBlock,
      ...splitListItem,
      ...toggleList,
      ...toggleMark,
      ...toggleNode,
      ...toggleWrap,
      ...undoInputRule,
      ...unsetAllMarks,
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

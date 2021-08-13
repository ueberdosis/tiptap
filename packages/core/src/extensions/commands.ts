import { Extension } from '../Extension'
import * as blur from '../commands/blur'
import * as clearContent from '../commands/clearContent'
import * as clearNodes from '../commands/clearNodes'
import * as command from '../commands/command'
import * as createParagraphNear from '../commands/createParagraphNear'
import * as deleteNode from '../commands/deleteNode'
import * as deleteRange from '../commands/deleteRange'
import * as deleteSelection from '../commands/deleteSelection'
import * as enter from '../commands/enter'
import * as exitCode from '../commands/exitCode'
import * as extendMarkRange from '../commands/extendMarkRange'
import * as first from '../commands/first'
import * as focus from '../commands/focus'
import * as forEach from '../commands/forEach'
import * as insertContent from '../commands/insertContent'
import * as insertContentAt from '../commands/insertContentAt'
import * as joinBackward from '../commands/joinBackward'
import * as joinForward from '../commands/joinForward'
import * as keyboardShortcut from '../commands/keyboardShortcut'
import * as lift from '../commands/lift'
import * as liftEmptyBlock from '../commands/liftEmptyBlock'
import * as liftListItem from '../commands/liftListItem'
import * as newlineInCode from '../commands/newlineInCode'
import * as resetAttributes from '../commands/resetAttributes'
import * as scrollIntoView from '../commands/scrollIntoView'
import * as selectAll from '../commands/selectAll'
import * as selectNodeBackward from '../commands/selectNodeBackward'
import * as selectNodeForward from '../commands/selectNodeForward'
import * as selectParentNode from '../commands/selectParentNode'
import * as setContent from '../commands/setContent'
import * as setMark from '../commands/setMark'
import * as setMeta from '../commands/setMeta'
import * as setNode from '../commands/setNode'
import * as setNodeSelection from '../commands/setNodeSelection'
import * as setTextSelection from '../commands/setTextSelection'
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
import * as updateAttributes from '../commands/updateAttributes'
import * as wrapIn from '../commands/wrapIn'
import * as wrapInList from '../commands/wrapInList'

export { blur }
export { clearContent }
export { clearNodes }
export { command }
export { createParagraphNear }
export { deleteNode }
export { deleteRange }
export { deleteSelection }
export { enter }
export { exitCode }
export { extendMarkRange }
export { first }
export { focus }
export { forEach }
export { insertContent }
export { insertContentAt }
export { joinBackward }
export { joinForward }
export { keyboardShortcut }
export { lift }
export { liftEmptyBlock }
export { liftListItem }
export { newlineInCode }
export { resetAttributes }
export { scrollIntoView }
export { selectAll }
export { selectNodeBackward }
export { selectNodeForward }
export { selectParentNode }
export { setContent }
export { setMark }
export { setMeta }
export { setNode }
export { setNodeSelection }
export { setTextSelection }
export { sinkListItem }
export { splitBlock }
export { splitListItem }
export { toggleList }
export { toggleMark }
export { toggleNode }
export { toggleWrap }
export { undoInputRule }
export { unsetAllMarks }
export { unsetMark }
export { updateAttributes }
export { wrapIn }
export { wrapInList }

export const Commands = Extension.create({
  name: 'commands',

  addCommands() {
    return {
      ...blur,
      ...clearContent,
      ...clearNodes,
      ...command,
      ...createParagraphNear,
      ...deleteNode,
      ...deleteRange,
      ...deleteSelection,
      ...enter,
      ...exitCode,
      ...extendMarkRange,
      ...first,
      ...focus,
      ...forEach,
      ...insertContent,
      ...insertContentAt,
      ...joinBackward,
      ...joinForward,
      ...keyboardShortcut,
      ...lift,
      ...liftEmptyBlock,
      ...liftListItem,
      ...newlineInCode,
      ...resetAttributes,
      ...scrollIntoView,
      ...selectAll,
      ...selectNodeBackward,
      ...selectNodeForward,
      ...selectParentNode,
      ...setContent,
      ...setMark,
      ...setMeta,
      ...setNode,
      ...setNodeSelection,
      ...setTextSelection,
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
      ...updateAttributes,
      ...wrapIn,
      ...wrapInList,
    }
  },
})

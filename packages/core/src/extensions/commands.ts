import { createExtension } from '../Extension'
import blur from '../commands/blur'
import clearContent from '../commands/clearContent'
import clearNodes from '../commands/clearNodes'
import deleteSelection from '../commands/deleteSelection'
import focus from '../commands/focus'
import insertHTML from '../commands/insertHTML'
import insertText from '../commands/insertText'
import liftListItem from '../commands/liftListItem'
import removeMark from '../commands/removeMark'
import removeMarks from '../commands/removeMarks'
import resetNodeAttributes from '../commands/resetNodeAttributes'
import scrollIntoView from '../commands/scrollIntoView'
import selectAll from '../commands/selectAll'
import selectParentNode from '../commands/selectParentNode'
import setBlockType from '../commands/setBlockType'
import setContent from '../commands/setContent'
import sinkListItem from '../commands/sinkListItem'
import splitBlock from '../commands/splitBlock'
import splitListItem from '../commands/splitListItem'
import toggleBlockType from '../commands/toggleBlockType'
import toggleList from '../commands/toggleList'
import toggleMark from '../commands/toggleMark'
import toggleWrap from '../commands/toggleWrap'
import tryCommand from '../commands/try'
import updateMarkAttributes from '../commands/updateMarkAttributes'
import updateNodeAttributes from '../commands/updateNodeAttributes'
import wrapInList from '../commands/wrapInList'

export const Commands = createExtension({
  addCommands() {
    return {
      blur,
      clearContent,
      clearNodes,
      deleteSelection,
      focus,
      insertHTML,
      insertText,
      liftListItem,
      removeMark,
      removeMarks,
      resetNodeAttributes,
      scrollIntoView,
      selectAll,
      selectParentNode,
      setBlockType,
      setContent,
      sinkListItem,
      splitBlock,
      splitListItem,
      toggleBlockType,
      toggleList,
      toggleMark,
      toggleWrap,
      try: tryCommand,
      updateMarkAttributes,
      updateNodeAttributes,
      wrapInList,
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    Commands: typeof Commands,
  }
}

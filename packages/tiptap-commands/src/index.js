import {
  chainCommands,
  deleteSelection,
  joinBackward,
  selectNodeBackward,
  joinForward,
  selectNodeForward,
  joinUp,
  joinDown,
  lift,
  newlineInCode,
  exitCode,
  createParagraphNear,
  liftEmptyBlock,
  splitBlock,
  splitBlockKeepMarks,
  selectParentNode,
  selectAll,
  wrapIn,
  setBlockType,
  toggleMark,
  autoJoin,
  baseKeymap,
  pcBaseKeymap,
  macBaseKeymap,
} from 'prosemirror-commands'

import {
  addListNodes,
  wrapInList,
  splitListItem,
  liftListItem,
  sinkListItem,
} from 'prosemirror-schema-list'

import {
  wrappingInputRule,
  textblockTypeInputRule,
} from 'prosemirror-inputrules'

import insertText from './commands/insertText'
import markInputRule from './commands/markInputRule'
import nodeInputRule from './commands/nodeInputRule'
import pasteRule from './commands/pasteRule'
import markPasteRule from './commands/markPasteRule'
import removeMark from './commands/removeMark'
import replaceText from './commands/replaceText'
import setInlineBlockType from './commands/setInlineBlockType'
import splitToDefaultListItem from './commands/splitToDefaultListItem'
import toggleBlockType from './commands/toggleBlockType'
import toggleList from './commands/toggleList'
import toggleWrap from './commands/toggleWrap'
import updateMark from './commands/updateMark'

export {
  // prosemirror-commands
  chainCommands,
  deleteSelection,
  joinBackward,
  selectNodeBackward,
  joinForward,
  selectNodeForward,
  joinUp,
  joinDown,
  lift,
  newlineInCode,
  exitCode,
  createParagraphNear,
  liftEmptyBlock,
  splitBlock,
  splitBlockKeepMarks,
  selectParentNode,
  selectAll,
  wrapIn,
  setBlockType,
  toggleMark,
  autoJoin,
  baseKeymap,
  pcBaseKeymap,
  macBaseKeymap,

  // prosemirror-schema-list
  addListNodes,
  wrapInList,
  splitListItem,
  liftListItem,
  sinkListItem,

  // prosemirror-inputrules
  wrappingInputRule,
  textblockTypeInputRule,

  // custom
  insertText,
  markInputRule,
  markPasteRule,
  nodeInputRule,
  pasteRule,
  removeMark,
  replaceText,
  setInlineBlockType,
  splitToDefaultListItem,
  toggleBlockType,
  toggleList,
  toggleWrap,
  updateMark,
}

import { Extension } from '../Extension'
import blur from '../commands/blur'
import clearContent from '../commands/clearContent'
import command from '../commands/command'
import clearNodes from '../commands/clearNodes'
import deleteSelection from '../commands/deleteSelection'
import extendMarkRange from '../commands/extendMarkRange'
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

export const Commands = Extension.create({
  addCommands() {
    return {
      /**
       * Removes focus from the editor.
       */
      blur,
      /**
       * Clear the whole document.
       */
      clearContent,
      /**
       * Normalize nodes to a simple paragraph.
       */
      clearNodes,
      /**
       * Define a command inline.
       */
      command,
      /**
       * Delete the selection, if there is one.
       */
      deleteSelection,
      /**
       * Extends the text selection to the current mark.
       */
      extendMarkRange,
      /**
       * Focus the editor at the given position.
       */
      focus,
      /**
       * Insert a string of HTML at the current position.
       */
      insertHTML,
      /**
       * Insert a string of text at the current position.
       */
      insertText,
      /**
       * Lift the list item into a wrapping list.
       */
      liftListItem,
      /**
       * Remove all marks in the current selection.
       */
      removeMark,
      /**
       * Remove all marks in the current selection.
       */
      removeMarks,
      /**
       * Resets all node attributes to the default value.
       */
      resetNodeAttributes,
      /**
       * Scroll the selection into view.
       */
      scrollIntoView,
      /**
       * Select the whole document.
       */
      selectAll,
      /**
       * Select the parent node.
       */
      selectParentNode,
      /**
       * Replace a given range with a node.
       */
      setBlockType,
      /**
       * Replace the whole document with new content.
       */
      setContent,
      /**
       * Sink the list item down into an inner list.
       */
      sinkListItem,
      /**
       * Forks a new node from an existing node.
       */
      splitBlock,
      /**
       * Splits one list item into two list items.
       */
      splitListItem,
      /**
       * Toggle a node with another node.
       */
      toggleBlockType,
      /**
       * Toggle between different list types.
       */
      toggleList,
      /**
       * Toggle a mark on and off.
       */
      toggleMark,
      /**
       * Wraps nodes in another node, or removes an existing wrap.
       */
      toggleWrap,
      /**
       * Runs one command after the other and stops at the first which returns true.
       */
      try: tryCommand,
      /**
       * Update a mark with new attributes.
       */
      updateMarkAttributes,
      /**
       * Update attributes of a node.
       */
      updateNodeAttributes,
      /**
       * Wrap a node in a list.
       */
      wrapInList,
    }
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Commands: typeof Commands,
  }
}

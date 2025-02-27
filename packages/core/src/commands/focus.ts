import { isTextSelection } from '../helpers/isTextSelection.js'
import { resolveFocusPosition } from '../helpers/resolveFocusPosition.js'
import { FocusPosition, RawCommands } from '../types.js'
import { isAndroid } from '../utilities/isAndroid.js'
import { isiOS } from '../utilities/isiOS.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    focus: {
      /**
       * Focus the editor at the given position.
       * @param position The position to focus at.
       * @param options.scrollIntoView Scroll the focused position into view after focusing
       * @example editor.commands.focus()
       * @example editor.commands.focus(32, { scrollIntoView: false })
       */
      focus: (
        /**
         * The position to focus at.
         */
        position?: FocusPosition,

        /**
         * Optional options
         * @default { scrollIntoView: true }
         */
        options?: {
          scrollIntoView?: boolean,
        },
      ) => ReturnType,
    }
  }
}

export const focus: RawCommands['focus'] = (position = null, options = {}) => ({
  editor,
  view,
  tr,
  dispatch,
}) => {
  options = {
    scrollIntoView: true,
    ...options,
  }

  const delayedFocus = () => {
    // focus within `requestAnimationFrame` breaks focus on iOS and Android
    // so we have to call this
    if (isiOS() || isAndroid()) {
      (view.dom as HTMLElement).focus()
    }

    // For React we have to focus asynchronously. Otherwise wild things happen.
    // see: https://github.com/ueberdosis/tiptap/issues/1520
    requestAnimationFrame(() => {
      if (!editor.isDestroyed) {
        view.focus()

        if (options?.scrollIntoView) {
          editor.commands.scrollIntoView()
        }
      }
    })
  }

  if ((view.hasFocus() && position === null) || position === false) {
    return true
  }

  // we don’t try to resolve a NodeSelection or CellSelection
  if (dispatch && position === null && !isTextSelection(editor.state.selection)) {
    delayedFocus()
    return true
  }

  // pass through tr.doc instead of editor.state.doc
  // since transactions could change the editors state before this command has been run
  const selection = resolveFocusPosition(tr.doc, position) || editor.state.selection
  const isSameSelection = editor.state.selection.eq(selection)

  if (dispatch) {
    if (!isSameSelection) {
      tr.setSelection(selection)
    }

    // `tr.setSelection` resets the stored marks
    // so we’ll restore them if the selection is the same as before
    if (isSameSelection && tr.storedMarks) {
      tr.setStoredMarks(tr.storedMarks)
    }

    delayedFocus()
  }

  return true
}

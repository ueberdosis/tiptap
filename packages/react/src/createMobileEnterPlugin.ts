import type { Editor } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { createCompositionEnterTracker } from './handleCompositionEnter.js'
import { handleMobileEnter } from './handleMobileEnter.js'

export const mobileEnterPluginKey = new PluginKey('reactMobileEnter')

/** Handles Enter from mobile keyboards inside React node views. */
export function createMobileEnterPlugin(editor: Editor): Plugin {
  const compositionEnter = createCompositionEnterTracker(editor)

  return new Plugin({
    key: mobileEnterPluginKey,
    appendTransaction: transactions => {
      compositionEnter.mapTransactions(transactions)
      return null
    },
    props: {
      handleDOMEvents: {
        beforeinput: (_view, event) => {
          compositionEnter.beforeInput(event)
          handleMobileEnter(editor, event)
          return false
        },
        compositionend: (_view, event) => {
          compositionEnter.compositionEnd(event)
          return false
        },
      },
    },
  })
}

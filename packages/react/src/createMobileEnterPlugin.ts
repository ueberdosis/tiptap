import type { Editor } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import type { CompositionEnter } from './handleCompositionEnter.js'
import { captureCompositionEnter, handleCompositionEnterEnd } from './handleCompositionEnter.js'
import { handleMobileEnter } from './handleMobileEnter.js'

export const mobileEnterPluginKey = new PluginKey('reactMobileEnter')

/** Handles Enter from mobile keyboards inside React node views. */
export function createMobileEnterPlugin(editor: Editor): Plugin {
  let compositionEnter: CompositionEnter | null = null

  return new Plugin({
    key: mobileEnterPluginKey,
    props: {
      handleDOMEvents: {
        beforeinput: (_view, event) => {
          compositionEnter = captureCompositionEnter(editor, event)
          handleMobileEnter(editor, event)
          return false
        },
        compositionend: (_view, event) => {
          handleCompositionEnterEnd(editor, event, compositionEnter)
          compositionEnter = null
          return false
        },
      },
    },
  })
}

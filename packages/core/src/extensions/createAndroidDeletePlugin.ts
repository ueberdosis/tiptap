import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import { isAndroid } from '../utilities/isAndroid.js'

export function createAndroidDeletePlugin() {
  return new Plugin({
    key: new PluginKey('androidDelete'),
    props: {
      handleDOMEvents: {
        input(view, event) {
          if (!isAndroid() || event.inputType !== 'deleteContentBackward') {
            return false
          }

          const { domObserver } = view as EditorView & {
            domObserver: { forceFlush: () => void; flush: () => void }
          }

          // Reconcile native deletion before the delayed focus handler restores the caret.
          domObserver.forceFlush()
          domObserver.flush()

          return false
        },
      },
    },
  })
}

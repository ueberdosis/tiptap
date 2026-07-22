import { Plugin, PluginKey } from '@tiptap/pm/state'

import { currentResultClass, resultClass } from './constants.js'
import { createStyleTag } from './create-style-tag.js'
import type { FindAndReplaceMeta, FindAndReplacePluginState } from './plugin-state.js'
import { style } from './style.js'
import type { FindAndReplaceOptions } from './types.js'
import { createState, updateState } from './utils/index.js'

export { currentResultClass, resultClass }
export type { FindAndReplaceMeta, FindAndReplacePluginState }

export const FindAndReplacePluginKey = new PluginKey<FindAndReplacePluginState>('findAndReplace')

export const FindAndReplacePlugin = (
  options: FindAndReplaceOptions,
  onCreate: (pluginState: FindAndReplacePluginState) => void,
) => {
  return new Plugin<FindAndReplacePluginState>({
    key: FindAndReplacePluginKey,

    state: {
      init: (_config, state) => {
        if (options.injectCSS && typeof document !== 'undefined') {
          createStyleTag(style, options.injectNonce)
        }

        const pluginState = createState(state.doc, options)
        onCreate(pluginState)

        return pluginState
      },

      apply: (tr, state, _oldState, newState) => {
        const meta = tr.getMeta(FindAndReplacePluginKey) as FindAndReplaceMeta | undefined

        if (!meta && !tr.docChanged) {
          return state
        }

        return updateState(
          state,
          { ...state, ...meta },
          newState.doc,
          meta,
          tr.docChanged,
          tr.mapping,
        )
      },
    },

    props: {
      decorations(state) {
        return FindAndReplacePluginKey.getState(state)?.decorations
      },
    },
  })
}

export default FindAndReplacePlugin

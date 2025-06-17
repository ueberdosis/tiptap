import type { EditorState } from '@tiptap/pm/state'
import { AllSelection, Plugin, PluginKey } from '@tiptap/pm/state'
import { DecorationSet } from '@tiptap/pm/view'

import type { InvisibleCharactersOptions, PluginState } from '../types.js'
import { stateReducer } from './reducers.js'
import { style } from './style.js'
import { createStyleTag } from './utils/create-style-tag.js'
import { getUpdatedRanges } from './utils/get-updated-ranges.js'

export const InvisibleCharactersPluginKey = new PluginKey<PluginState>('invisibleCharacters')

export const InvisibleCharactersPlugin = (state: EditorState, options: InvisibleCharactersOptions) => {
  const key = InvisibleCharactersPluginKey
  const emptyDecorationSet = DecorationSet.create(state.doc, [])

  const addDecorationsBetweenPositions = (
    from: number,
    to: number,
    editorState: EditorState,
    decorations: DecorationSet,
  ) => {
    return options.builders
      .sort((builderA, builderB) => {
        if (builderA.priority > builderB.priority) {
          return 1
        }

        return -1
      })
      .reduce((newDecos, builder) => {
        return builder.createDecoration(from, to, editorState.doc, newDecos)
      }, decorations)
  }

  return new Plugin({
    key,

    state: {
      init: () => {
        const { $from, $to } = new AllSelection(state.doc)

        if (options.injectCSS && document) {
          createStyleTag(style, options.injectNonce)
        }

        return {
          visible: options.visible,
          decorations: addDecorationsBetweenPositions($from.pos, $to.pos, state, DecorationSet.empty),
        }
      },
      apply: (tr, pluginState, _, currentState) => {
        const newPluginState = stateReducer(pluginState, tr.getMeta('setInvisibleCharactersVisible'))

        const decorations = getUpdatedRanges(tr).reduce(
          (nextDecorations, [from, to]) => {
            return addDecorationsBetweenPositions(from, to, currentState, nextDecorations)
          },
          newPluginState.decorations.map(tr.mapping, tr.doc),
        )

        return {
          ...newPluginState,
          decorations,
        }
      },
    },

    props: {
      decorations(editorState) {
        const pluginState = this.getState(editorState)

        const visible = pluginState?.visible
        const decorations = pluginState?.decorations

        return visible ? decorations : emptyDecorationSet
      },
    },
  })
}

export default InvisibleCharactersPlugin

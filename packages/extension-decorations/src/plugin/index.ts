import {
  AllSelection, EditorState, Plugin, PluginKey,
} from 'prosemirror-state'
import { DecorationSet } from 'prosemirror-view'

import { DecorationsOptions } from '../types'
import { getUpdatedRanges, stateReducer } from './utils'

interface PluginState {
  decorations: DecorationSet | null
  active: boolean
}

const defaultOptions: DecorationsOptions = {
  builders: [],
}

export const DecorationsPlugin = (state: EditorState, options: DecorationsOptions = defaultOptions) => {
  const key = new PluginKey<PluginState>('TIPTAP_EXTENSION_DECORATIONS')
  const decorationSet = DecorationSet.create(state.doc, [])

  const { builders } = options

  const addDecorationsBetweenPositions = (
    from: number,
    to: number,
    editorState: EditorState,
    decs: DecorationSet,
  ) => {
    return builders.sort((builderA, builderB) => {
      if (builderA.priority > builderB.priority) {
        return 1
      }

      return -1
    }).reduce((newDecos, builder) => {
      return builder.createDecoration(from, to, editorState.doc, newDecos)
    }, decs)
  }

  return new Plugin({
    key,

    state: {
      init: () => {
        const { $from, $to } = new AllSelection(state.doc)

        return {
          isActive: true,
          decorations: addDecorationsBetweenPositions($from.pos, $to.pos, state, DecorationSet.empty),
        }
      },
      apply: (tr, pluginState, _, currentState) => {
        const newPluginState = stateReducer(pluginState, tr.getMeta('setDecorationsActive'))

        const decorations = getUpdatedRanges(tr).reduce((nextDecos, [from, to]) => {
          return addDecorationsBetweenPositions(from, to, currentState, nextDecos)
        }, newPluginState.decorations.map(tr.mapping, tr.doc))

        return {
          ...newPluginState,
          decorations,
        }
      },
    },

    props: {
      decorations(editorState) {
        return key?.getState(editorState)?.decorations || decorationSet
      },
    },
  })
}

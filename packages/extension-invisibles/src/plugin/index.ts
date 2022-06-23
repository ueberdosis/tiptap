import {
  AllSelection, EditorState, Plugin, PluginKey,
} from 'prosemirror-state'
import { DecorationSet } from 'prosemirror-view'

import { BuilderFn, InvisiblesOptions } from '../types'
import { hardBreak } from './invisibles/hardBreak'
import { paragraph } from './invisibles/paragraph'
import { space } from './invisibles/space'

interface PluginState {
  decorations: DecorationSet | null
  active: boolean
}

export const InvisiblesPlugin = (state: EditorState, options: InvisiblesOptions) => {
  const key = new PluginKey<PluginState>('TIPTAP_EXTENSION_INVISIBLES')
  const decorationSet = DecorationSet.create(state.doc, [])

  const builders: BuilderFn[] = []

  if (options.spaces) {
    builders.push(space)
  }

  if (options.hardBreaks) {
    builders.push(hardBreak)
  }

  if (options.paragraph) {
    builders.push(paragraph)
  }

  const addDecorationsBetweenPositions = (
    from: number,
    to: number,
    editorState: EditorState,
    decs: DecorationSet,
  ) => {
    return builders.reduce((newDecos, fn) => {
      return fn()(from, to, editorState.doc, newDecos)
    }, decs)
  }

  return new Plugin({
    key,

    state: {
      init: () => {
        const { $from, $to } = new AllSelection(state.doc)

        return {
          isActive: true,
          decorations: addDecorationsBetweenPositions($from.pos, $to.pos, state, decorationSet),
        }
      },
      apply: (tr, pluginState, _, currentState) => {
        const { $from, $to } = new AllSelection(currentState.doc)

        if (!tr.docChanged) {
          return pluginState
        }

        return {
          ...pluginState,
          decorations: addDecorationsBetweenPositions($from.pos, $to.pos, currentState, decorationSet),
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

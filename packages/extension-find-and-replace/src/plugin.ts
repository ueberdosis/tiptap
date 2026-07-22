import type { Node } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import { createStyleTag } from './create-style-tag.js'
import type { SearchResult } from './search.js'
import { searchDocument } from './search.js'
import { style } from './style.js'
import type { FindAndReplaceOptions } from './types.js'

export const FindAndReplacePluginKey = new PluginKey<FindAndReplacePluginState>('findAndReplace')

export const resultClass = 'find-and-replace-result'
export const currentResultClass = 'find-and-replace-result-current'

export interface FindAndReplacePluginState {
  searchTerm: string
  replaceTerm: string
  caseSensitive: boolean
  useRegex: boolean
  wholeWord: boolean
  results: SearchResult[]
  currentIndex: number | null
  decorations: DecorationSet
}

/**
 * Transaction meta to patch the plugin state. Setting `searchTerm`,
 * `caseSensitive`, `useRegex` or `wholeWord` re-runs the search.
 */
export interface FindAndReplaceMeta {
  searchTerm?: string
  replaceTerm?: string
  caseSensitive?: boolean
  useRegex?: boolean
  wholeWord?: boolean
  currentIndex?: number | null
}

const searchKeys = ['searchTerm', 'caseSensitive', 'useRegex', 'wholeWord'] as const

function touchesSearch(meta: FindAndReplaceMeta | undefined): boolean {
  return !!meta && searchKeys.some(key => key in meta)
}

function createDecorations(
  doc: Node,
  results: SearchResult[],
  currentIndex: number | null,
): DecorationSet {
  const decorations = results.map((result, index) => {
    const className = index === currentIndex ? `${resultClass} ${currentResultClass}` : resultClass

    return Decoration.inline(result.from, result.to, { class: className })
  })

  return DecorationSet.create(doc, decorations)
}

function isNewSearch(meta: FindAndReplaceMeta | undefined): boolean {
  return !!meta && 'searchTerm' in meta
}

function clampIndex(
  currentIndex: number | null,
  results: SearchResult[],
  meta: FindAndReplaceMeta | undefined,
): number | null {
  if (results.length === 0) {
    return null
  }

  if (isNewSearch(meta)) {
    return 0
  }

  if (currentIndex === null) {
    return 0
  }

  return Math.min(currentIndex, results.length - 1)
}

function refreshState(
  state: FindAndReplacePluginState,
  doc: Node,
  meta: FindAndReplaceMeta | undefined,
): FindAndReplacePluginState {
  const results = searchDocument(doc, state.searchTerm, state)
  const currentIndex = clampIndex(state.currentIndex, results, meta)

  return {
    ...state,
    results,
    currentIndex,
    decorations: createDecorations(doc, results, currentIndex),
  }
}

function updateState(
  state: FindAndReplacePluginState,
  doc: Node,
  meta: FindAndReplaceMeta | undefined,
  docChanged: boolean,
): FindAndReplacePluginState {
  if (docChanged || touchesSearch(meta)) {
    return refreshState(state, doc, meta)
  }

  return { ...state, decorations: createDecorations(doc, state.results, state.currentIndex) }
}

function createState(doc: Node, options: FindAndReplaceOptions): FindAndReplacePluginState {
  const results = searchDocument(doc, options.searchTerm, options)
  const currentIndex = results.length > 0 ? 0 : null

  return {
    searchTerm: options.searchTerm,
    replaceTerm: options.replaceTerm,
    caseSensitive: options.caseSensitive,
    useRegex: options.useRegex,
    wholeWord: options.wholeWord,
    results,
    currentIndex,
    decorations: createDecorations(doc, results, currentIndex),
  }
}

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

        return updateState({ ...state, ...meta }, newState.doc, meta, tr.docChanged)
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

import { Extension } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface SearchResult {
  from: number
  to: number
}

export interface SearchAndReplaceOptions {
  searchResultClass: string
  searchResultCurrentClass: string
  disableBrowserSearch: boolean
  caseSensitive: boolean
  searchDebounce: number
}

export interface SearchAndReplaceStorage {
  searchTerm: string
  results: SearchResult[]
  resultIndex: number
  lastSearchTerm: string
  caseSensitive: boolean
}

const searchAndReplacePluginKey = new PluginKey('searchAndReplace')

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const findMatches = (doc: ProsemirrorNode, searchTerm: string, caseSensitive: boolean): SearchResult[] => {
  if (!searchTerm) {
    return []
  }

  const results: SearchResult[] = []
  const flags = caseSensitive ? 'g' : 'gi'
  const regex = new RegExp(escapeRegExp(searchTerm), flags)

  doc.descendants((node, pos) => {
    if (node.isText) {
      const text = node.text
      if (!text) {
        return
      }

      let match: RegExpExecArray | null = regex.exec(text)
      while (match) {
        results.push({
          from: pos + match.index,
          to: pos + match.index + match[0].length,
        })
        match = regex.exec(text)
      }
    }
  })

  return results
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    searchAndReplace: {
      setSearchTerm: (searchTerm: string) => ReturnType
      clearSearch: () => ReturnType
      nextSearchResult: () => ReturnType
      previousSearchResult: () => ReturnType
      replace: (replacement: string) => ReturnType
      replaceAll: (replacement: string) => ReturnType
      setCaseSensitive: (caseSensitive: boolean) => ReturnType
    }
  }

  interface Storage {
    searchAndReplace: SearchAndReplaceStorage
  }

  interface ExtensionOptions {
    searchAndReplace?: Partial<SearchAndReplaceOptions>
  }
}

export const SearchAndReplace = Extension.create<SearchAndReplaceOptions, SearchAndReplaceStorage>({
  name: 'searchAndReplace',

  addOptions() {
    return {
      searchResultClass: 'search-result',
      searchResultCurrentClass: 'search-result-current',
      disableBrowserSearch: false,
      caseSensitive: false,
      searchDebounce: 300,
    }
  },

  addStorage() {
    return {
      searchTerm: '',
      results: [],
      resultIndex: 0,
      lastSearchTerm: '',
      caseSensitive: false,
    }
  },

  addCommands() {
    return {
      setSearchTerm:
        (searchTerm: string) =>
        ({ editor }) => {
          const storage = editor.storage.searchAndReplace
          const termChanged = storage.searchTerm !== searchTerm
          storage.searchTerm = searchTerm
          if (termChanged) {
            storage.resultIndex = 0
          }
          editor.view.dispatch(editor.state.tr)
          return true
        },

      clearSearch:
        () =>
        ({ editor }) => {
          editor.storage.searchAndReplace.searchTerm = ''
          editor.storage.searchAndReplace.results = []
          editor.storage.searchAndReplace.resultIndex = 0
          editor.storage.searchAndReplace.lastSearchTerm = ''
          editor.view.dispatch(editor.state.tr)
          return true
        },

      nextSearchResult:
        () =>
        ({ editor }) => {
          const { results, resultIndex } = editor.storage.searchAndReplace
          if (results.length === 0) {
            return false
          }

          const nextIndex = (resultIndex + 1) % results.length
          editor.storage.searchAndReplace.resultIndex = nextIndex

          const result = results[nextIndex]
          if (result) {
            editor.commands.scrollIntoView()
            editor.commands.setTextSelection(result)
          }

          editor.view.dispatch(editor.state.tr)
          return true
        },

      previousSearchResult:
        () =>
        ({ editor }) => {
          const { results, resultIndex } = editor.storage.searchAndReplace
          if (results.length === 0) {
            return false
          }

          const prevIndex = (resultIndex - 1 + results.length) % results.length
          editor.storage.searchAndReplace.resultIndex = prevIndex

          const result = results[prevIndex]
          if (result) {
            editor.commands.scrollIntoView()
            editor.commands.setTextSelection(result)
          }

          editor.view.dispatch(editor.state.tr)
          return true
        },

      replace:
        (replacement: string) =>
        ({ state, dispatch, editor }) => {
          const { results, resultIndex } = editor.storage.searchAndReplace
          const currentResult = results[resultIndex]

          if (!currentResult) {
            return false
          }

          if (dispatch) {
            const tr = state.tr
            tr.insertText(replacement, currentResult.from, currentResult.to)
            // Trigger a re-scan by setting meta (the plugin view will handle it)
            tr.setMeta(searchAndReplacePluginKey, { triggerRecalc: true })
            dispatch(tr)
          }
          return true
        },

      replaceAll:
        (replacement: string) =>
        ({ state, dispatch, editor }) => {
          const { results } = editor.storage.searchAndReplace
          if (results.length === 0) {
            return false
          }

          if (dispatch) {
            const tr = state.tr
            for (let i = results.length - 1; i >= 0; i -= 1) {
              const result = results[i]
              tr.insertText(replacement, result.from, result.to)
            }
            tr.setMeta(searchAndReplacePluginKey, { triggerRecalc: true })
            dispatch(tr)
          }
          return true
        },

      setCaseSensitive:
        (caseSensitive: boolean) =>
        ({ editor }) => {
          editor.storage.searchAndReplace.caseSensitive = caseSensitive
          // Force a re-run of the current search by invalidating the cached term
          editor.storage.searchAndReplace.lastSearchTerm = ''
          editor.view.dispatch(editor.state.tr)
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const editor = this.editor
    const { searchResultClass, searchResultCurrentClass, searchDebounce } = this.options

    const debouncedSearch = debounce((view: any, searchTerm: string) => {
      // EditorView uses `destroyed` (boolean) when destroyed — guard defensively
      if ((view as any).destroyed) {
        return
      }

      const caseSensitive = editor.storage?.searchAndReplace?.caseSensitive ?? false
      const results = findMatches(view.state.doc, searchTerm, caseSensitive)

      const tr = view.state.tr
      tr.setMeta(searchAndReplacePluginKey, { results, searchTerm })
      view.dispatch(tr)
    }, searchDebounce)

    return [
      new Plugin({
        key: searchAndReplacePluginKey,
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr: any, oldSet: any) {
            const meta = tr.getMeta(searchAndReplacePluginKey)

            const storage = (editor.storage as any).searchAndReplace as SearchAndReplaceStorage

            if (meta && meta.results) {
              storage.results = meta.results
              storage.lastSearchTerm = meta.searchTerm || ''

              const decorations: Decoration[] = []
              meta.results.forEach((result: SearchResult, index: number) => {
                const isCurrent = index === storage.resultIndex
                const className = isCurrent ? `${searchResultClass} ${searchResultCurrentClass}` : searchResultClass
                decorations.push(Decoration.inline(result.from, result.to, { class: className }))
              })
              return DecorationSet.create(tr.doc, decorations)
            }

            const searchTerm = storage.searchTerm

            if (!searchTerm) {
              storage.results = []
              return DecorationSet.empty
            }

            if (tr.docChanged && oldSet) {
              storage.results = storage.results.map((r: SearchResult) => ({
                from: tr.mapping.map(r.from),
                to: tr.mapping.map(r.to),
              }))

              return oldSet.map(tr.mapping, tr.doc)
            }

            if (tr.selectionSet && oldSet) {
              const decorations: Decoration[] = []
              storage.results.forEach((result: SearchResult, index: number) => {
                const isCurrent = index === storage.resultIndex
                const className = isCurrent ? `${searchResultClass} ${searchResultCurrentClass}` : searchResultClass
                decorations.push(Decoration.inline(result.from, result.to, { class: className }))
              })
              return DecorationSet.create(tr.doc, decorations)
            }

            return oldSet
          },
        },
        view(_view: any) {
          return {
            update(view: any, prevState: any) {
              const storage = (editor.storage as any).searchAndReplace as SearchAndReplaceStorage
              const searchTerm = storage.searchTerm
              if (!searchTerm) {
                return
              }

              const docChanged = !view.state.doc.eq(prevState.doc)
              const termChanged = searchTerm !== storage.lastSearchTerm

              if (docChanged || termChanged) {
                debouncedSearch(view, searchTerm)
              }
            },
          }
        },
        props: {
          decorations(state: any) {
            // @ts-ignore - Plugin instance typing in Tiptap
            return this.getState(state)
          },
        },
      }),
    ]
  },
})

export default SearchAndReplace

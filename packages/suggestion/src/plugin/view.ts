import type { Editor } from '@tiptap/core'
import type { EditorState, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import type {
  PluginState,
  SuggestionFloatingUiOptions,
  SuggestionOptions,
  SuggestionPlacement,
  SuggestionProps,
} from '../types.js'
import { createSuggestionAsyncRequestManager } from './async.js'
import { createMount, createSuggestionFloatingUiConfig } from './floating-ui.js'

export interface CreateSuggestionViewOptions {
  editor: Editor
  pluginKey: PluginKey<PluginState>
  items: NonNullable<SuggestionOptions['items']>
  renderer: ReturnType<NonNullable<SuggestionOptions['render']>> | undefined
  minQueryLength: number
  debounce: number
  initialItems?: any[]
  placement: SuggestionPlacement
  offset: { mainAxis?: number; crossAxis?: number }
  container?: string | HTMLElement
  flip: boolean
  floatingUi?: SuggestionFloatingUiOptions
  dismissOnOutsideClick: boolean
  command: NonNullable<SuggestionOptions['command']>
  clientRectFor: (view: EditorView, decorationNode: Element | null) => () => DOMRect | null
  dispatchExit: (view: EditorView) => void
}

/**
 * Creates the `view` object for the suggestion ProseMirror plugin.
 *
 * Manages the async lifecycle: tracks state transitions, calls renderer hooks,
 * fetches items with debounce and AbortController support.
 *
 * 1. Tracks plugin state transitions (started, updated, stopped) to determine when to call renderer hooks.
 * 2. Calls `onBeforeStart`, `onBeforeUpdate`, `onStart` before fetching to allow the renderer to prepare for first render
 * 3. Manages async fetching of suggestion items with support for debouncing and aborting in-flight requests
 * 4. Calls `onUpdate` after fetching new items to update the renderer with the latest data
 * 5. At the end calls a final `onExit` or `onUpdate` to allow the renderer to clean up or finalize the state
 */
export function createSuggestionView({
  editor,
  pluginKey,
  items,
  renderer,
  minQueryLength,
  debounce,
  initialItems,
  placement,
  offset: offsetOption,
  container,
  flip,
  floatingUi,
  dismissOnOutsideClick,
  command,
  clientRectFor,
  dispatchExit,
}: CreateSuggestionViewOptions) {
  let props: SuggestionProps | undefined
  const asyncRequest = createSuggestionAsyncRequestManager({
    editor,
    items,
  })
  const floatingUiConfig = createSuggestionFloatingUiConfig({
    placement,
    offset: offsetOption,
    flip,
    floatingUi,
  })

  function dispatchStateUpdate(
    state: 'started' | 'updated' | 'stopped',
    dispatchProps: SuggestionProps,
  ) {
    switch (state) {
      case 'started':
        renderer?.onStart?.(dispatchProps)
        break
      case 'updated':
        renderer?.onUpdate?.(dispatchProps)
        break
      case 'stopped':
        renderer?.onExit?.(dispatchProps)
        break
      default:
        break
    }
  }

  return {
    update: async (view: EditorView, prevState: EditorState) => {
      const prev = pluginKey.getState(prevState)
      const next = pluginKey.getState(view.state)

      if (!prev || !next) {
        return
      }

      let currentState: 'started' | 'updated' | 'stopped' | null = null
      const queryChanged = prev.query !== next.query
      const textChanged = prev.text !== next.text
      const rangeChanged = prev.range.from !== next.range.from || prev.range.to !== next.range.to
      const effectiveQueryChanged = queryChanged || textChanged || rangeChanged

      if (!prev.active && next.active) {
        currentState = 'started'
      } else if (prev.active && !next.active) {
        currentState = 'stopped'
      } else if (next.active && effectiveQueryChanged) {
        currentState = 'updated'
      } else {
        return
      }

      const state = currentState === 'stopped' ? prev : next
      const decorationNode = view.dom.querySelector(`[data-decoration-id="${state.decorationId}"]`)
      const clientRect = clientRectFor(view, decorationNode)

      const exceedsMinQueryLength =
        minQueryLength === 0 || (state.query ? state.query.length >= minQueryLength : false)
      const willFetch =
        (currentState === 'started' || currentState === 'updated') && exceedsMinQueryLength

      props = {
        editor,
        range: state.range,
        query: state.query || '',
        text: state.text || '',
        items: initialItems ?? [],
        command: commandProps => {
          return command({
            editor,
            range: state.range,
            props: commandProps,
          })
        },
        decorationNode,
        clientRect,
        loading: willFetch,
        placement,
        offset: { mainAxis: offsetOption.mainAxis ?? 4, crossAxis: offsetOption.crossAxis ?? 0 },
        container,
        flip,
        floatingUi: floatingUiConfig,
        mount: createMount({
          getReferenceRect: clientRect,
          contextElement: view.dom,
          config: floatingUiConfig,
          container,
          dismissOnOutsideClick,
          dismiss: () => dispatchExit(editor.view),
        }),
      }

      if (currentState === 'started') {
        renderer?.onBeforeStart?.(props)
      }

      if (currentState === 'updated') {
        renderer?.onBeforeUpdate?.(props)
      }

      // we run the start before we fetch
      // to allow for the component to render immediately
      if (currentState === 'started') {
        dispatchStateUpdate(currentState, props)
      }

      if (currentState === 'started' || currentState === 'updated') {
        if (!willFetch) {
          // Abort any in-flight request so stale results don't overwrite
          asyncRequest.abort()
          props = { ...props, items: initialItems ?? [], loading: false }
        } else {
          // update the renderer with loading state before we start the async fetch
          props = { ...props, items: initialItems ?? [], loading: true }
          currentState = 'updated'
          dispatchStateUpdate(currentState, props)

          const result = await asyncRequest.fetch(state.query || '', debounce)

          if (result.status === 'aborted') {
            return
          }

          // Re-check plugin state because the suggestion may have been dismissed
          const currentPluginState = pluginKey.getState(view.state)
          if (!currentPluginState?.active) {
            asyncRequest.abort()

            return
          }

          props =
            result.status === 'resolved'
              ? {
                  ...props,
                  items: result.items,
                  loading: false,
                }
              : {
                  ...props,
                  loading: false,
                }
        }
      }

      if (currentState === 'stopped') {
        // stop running updates immediately and call onExit to allow the renderer to clean up
        asyncRequest.abort()
        dispatchStateUpdate(currentState, props)
        props = undefined
        return
      }

      if (currentState === 'updated') {
        dispatchStateUpdate(currentState, props)
      }
    },

    destroy: () => {
      asyncRequest.abort()

      if (!props) {
        return
      }

      renderer?.onExit?.(props)
    },
  }
}

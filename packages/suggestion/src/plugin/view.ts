import type { Editor, Range } from '@tiptap/core'
import type { EditorState, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import type { SuggestionOptions, SuggestionPlacement, SuggestionProps } from '../types.js'

type PluginState = { active: boolean; range: Range; query: string | null; text: string | null; decorationId?: string }

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
  command: NonNullable<SuggestionOptions['command']>
  clientRectFor: (view: EditorView, decorationNode: Element | null) => () => DOMRect | null
}

/**
 * Creates the `view` object for the suggestion ProseMirror plugin.
 * Manages the async lifecycle: tracks state transitions, calls renderer hooks,
 * fetches items with debounce and AbortController support.
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
  command,
  clientRectFor,
}: CreateSuggestionViewOptions) {
  let abortController: AbortController | null = null
  let props: SuggestionProps | undefined

  return {
    update: async (view: EditorView, prevState: EditorState) => {
      const prev = pluginKey.getState(prevState)
      const next = pluginKey.getState(view.state)

      if (!prev || !next) {
        return
      }

      // See how the state changed
      const moved = prev.active && next.active && prev.range.from !== next.range.from
      const started = !prev.active && next.active
      const stopped = prev.active && !next.active
      const changed = !started && !stopped && prev.query !== next.query

      const handleStart = started || (moved && changed)
      const handleChange = changed || moved
      const handleExit = stopped

      // Cancel when suggestion isn't active
      if (!handleStart && !handleChange && !handleExit) {
        return
      }

      const state = handleExit && !handleStart ? prev : next
      const decorationNode = view.dom.querySelector(`[data-decoration-id="${state.decorationId}"]`)

      const exceedsMinQueryLength = minQueryLength === 0 || (state.query ? state.query.length >= minQueryLength : false)
      const willFetch = (handleChange || handleStart) && exceedsMinQueryLength

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
        clientRect: clientRectFor(view, decorationNode),
        loading: willFetch,
        placement,
        offset: { mainAxis: offsetOption.mainAxis ?? 4, crossAxis: offsetOption.crossAxis ?? 0 },
        container,
        flip,
      }

      if (handleStart) {
        renderer?.onBeforeStart?.(props)
      }

      if (handleChange) {
        renderer?.onBeforeUpdate?.(props)
      }

      if (handleChange || handleStart) {
        if (!willFetch) {
          // Abort any in-flight request so stale results don't overwrite
          abortController?.abort()
          abortController = null
          props = { ...props, items: initialItems ?? [], loading: false }
        } else {
          props = { ...props, items: initialItems ?? [], loading: true }

          // update the renderer with loading state before we start the async fetch
          if (handleStart) {
            renderer?.onStart?.(props)
          } else {
            renderer?.onUpdate?.(props)
          }

          // Abort any in-flight fetch before starting a new one
          abortController?.abort()
          abortController = new AbortController()

          // Snapshot the controller so we can detect if a concurrent
          // update supersedes us during the debounce delay.
          const controller = abortController

          const doFetch = async () => {
            if (!props?.editor) {
              return
            }

            if (controller.signal.aborted) {
              props = { ...props, items: initialItems ?? [], loading: true }
              return
            }

            const result = await items({
              editor,
              query: state.query || '',
              signal: controller.signal,
            })

            // Re-check: items() may have taken a while and the controller
            // could have been aborted by a newer keystroke in the meantime.
            if (controller.signal.aborted) {
              props = { ...props, items: initialItems ?? [], loading: true }
            } else {
              props = {
                ...props,
                items: result,
                loading: false,
              }
            }
          }

          if (debounce > 0) {
            // Wrap the entire fetch inside the debounce delay so items()
            // is only called after the user stops typing.
            await new Promise<void>(resolve => {
              setTimeout(async () => {
                if (abortController !== controller || controller.signal.aborted) {
                  controller.abort()
                  resolve()
                  return
                }
                await doFetch()
                resolve()
              }, debounce)
            })
          } else {
            await doFetch()
          }
        }
      }

      if (handleExit) {
        renderer?.onExit?.(props)
      }

      if (handleChange) {
        renderer?.onUpdate?.(props)
      }

      if (handleStart) {
        renderer?.onStart?.(props)
      }
    },

    destroy: () => {
      abortController?.abort()

      if (!props) {
        return
      }

      renderer?.onExit?.(props)
    },
  }
}

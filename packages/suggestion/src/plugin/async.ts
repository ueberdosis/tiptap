import type { Editor } from '@tiptap/core'

import type { SuggestionOptions } from '../types.js'

export interface CreateSuggestionAsyncRequestManagerOptions<I = any> {
  editor: Editor
  items: NonNullable<SuggestionOptions<I>['items']>
}

type AsyncRequestResult<I> =
  | { status: 'resolved'; items: I[] }
  | { status: 'aborted' }
  | { status: 'error' }

export function createSuggestionAsyncRequestManager<I = any>({
  editor,
  items,
}: CreateSuggestionAsyncRequestManagerOptions<I>) {
  let abortController: AbortController | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let debounceResolve: (() => void) | null = null

  const clearDebounceTimer = () => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    debounceResolve?.()
    debounceResolve = null
  }

  const waitForDebounce = (delay: number) => {
    return new Promise<void>(resolve => {
      debounceResolve = resolve
      debounceTimer = setTimeout(() => {
        debounceTimer = null
        const pendingResolve = debounceResolve
        debounceResolve = null
        pendingResolve?.()
      }, delay)
    })
  }

  const abort = () => {
    abortController?.abort()
    clearDebounceTimer()
    abortController = null
  }

  const fetch = async (query: string, debounce: number): Promise<AsyncRequestResult<I>> => {
    abort()
    abortController = new AbortController()
    const controller = abortController

    if (debounce > 0) {
      await waitForDebounce(debounce)
    }

    if (abortController !== controller || controller.signal.aborted) {
      return { status: 'aborted' }
    }

    try {
      const result = await items({
        editor,
        query,
        signal: controller.signal,
      })

      if (abortController !== controller || controller.signal.aborted) {
        return { status: 'aborted' }
      }

      return { status: 'resolved', items: result }
    } catch {
      if (abortController !== controller || controller.signal.aborted) {
        return { status: 'aborted' }
      }

      return { status: 'error' }
    }
  }

  return {
    abort,
    fetch,
  }
}

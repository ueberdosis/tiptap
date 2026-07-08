import type { Selection } from '@tiptap/pm/state'
import type { RefObject } from 'react'
import { createContext, useContext } from 'react'

import type { ReactKeysPluginState } from '../plugins/reactKeys.js'

/** The per-render state document components read during render. */
export interface RenderState {
  keys: ReactKeysPluginState | null
  selection: Selection | null
}

const EMPTY_RENDER_STATE: RenderState = { keys: null, selection: null }

/**
 * Carries the current keys/selection down the document tree behind a
 * **stable ref**: the context value never changes identity, so it never
 * forces consumers to re-render — memoized subtrees that skip a commit
 * simply don't read it, and any component that does render reads current
 * values. (A plain value context would re-render every node on every
 * transaction, making typing O(document).)
 */
export const ReactKeysContext = createContext<RefObject<RenderState> | null>(null)

/** The current render state (keys + selection); empty without a provider. */
export const useRenderState = (): RenderState =>
  useContext(ReactKeysContext)?.current ?? EMPTY_RENDER_STATE

/** The reactKeys plugin state for the rendered document, if provided. */
export const useReactKeys = (): ReactKeysPluginState | null => useRenderState().keys

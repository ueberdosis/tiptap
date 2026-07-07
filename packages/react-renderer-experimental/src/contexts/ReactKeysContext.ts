import { createContext, useContext } from 'react'

import type { ReactKeysPluginState } from '../plugins/reactKeys.js'

/**
 * Provides the reactKeys plugin state of the rendered document. Without a
 * provider (static rendering, tests), components fall back to index keys.
 */
export const ReactKeysContext = createContext<ReactKeysPluginState | null>(null)

/** The reactKeys plugin state for the rendered document, if provided. */
export const useReactKeys = (): ReactKeysPluginState | null => useContext(ReactKeysContext)

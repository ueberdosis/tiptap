/**
 * Context that lets child `<NodeView>` components register themselves
 * with their parent's descriptor. The parent owns the list; children
 * push themselves in on mount and out on unmount.
 */

import { createContext } from 'react'

import type { ReactViewDesc } from '../viewdesc/index.js'

export interface ChildDescriptionsContextValue {
  /** Insert `desc` at `index` (or move it there if already present). */
  addChild(desc: ReactViewDesc, index: number): void
  /** Remove `desc`. No-op if not present. */
  removeChild(desc: ReactViewDesc): void
}

/** Default value is a pair of no-ops so components without a provider don't throw. */
export const ChildDescriptionsContext = createContext<ChildDescriptionsContextValue>({
  addChild: () => {},
  removeChild: () => {},
})

ChildDescriptionsContext.displayName = 'ChildDescriptionsContext'

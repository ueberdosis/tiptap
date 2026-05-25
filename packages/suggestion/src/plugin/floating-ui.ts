import type { Middleware } from '@floating-ui/dom'
import { flip as floatingUiFlip, offset as floatingUiOffset } from '@floating-ui/dom'

import type { SuggestionFloatingUiConfig, SuggestionFloatingUiOptions, SuggestionPlacement } from '../types.js'

export interface CreateSuggestionFloatingUiConfigOptions {
  placement: SuggestionPlacement
  offset: { mainAxis?: number; crossAxis?: number }
  flip: boolean
  floatingUi?: SuggestionFloatingUiOptions
}

export function createSuggestionFloatingUiConfig({
  placement,
  offset,
  flip,
  floatingUi,
}: CreateSuggestionFloatingUiConfigOptions): SuggestionFloatingUiConfig {
  const middleware: Middleware[] = [
    floatingUiOffset({
      mainAxis: offset.mainAxis ?? 4,
      crossAxis: offset.crossAxis ?? 0,
    }),
  ]

  if (flip) {
    middleware.push(floatingUiFlip())
  }

  if (floatingUi?.middleware?.length) {
    middleware.push(...floatingUi.middleware)
  }

  return {
    placement,
    strategy: floatingUi?.strategy ?? 'absolute',
    middleware,
  }
}

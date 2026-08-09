import type { Middleware, VirtualElement } from '@floating-ui/dom'
import {
  autoUpdate,
  computePosition,
  flip as floatingUiFlip,
  offset as floatingUiOffset,
} from '@floating-ui/dom'

import type {
  SuggestionFloatingUiConfig,
  SuggestionFloatingUiOptions,
  SuggestionMount,
  SuggestionPlacement,
} from '../types.js'

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

export interface CreateMountOptions {
  /** Returns the current cursor/anchor rect the popup should track. */
  getReferenceRect: () => DOMRect | null
  /**
   * An element inside the editor's layout/scroll context. Floating UI walks up
   * from here to discover the scroll ancestors (and the window) to observe, so
   * the scroll container does not need to be configured manually.
   */
  contextElement: Element
  /** Resolved Floating UI config (placement, strategy, middleware). */
  config: SuggestionFloatingUiConfig
  /**
   * CSS selector or element the popup should be mounted into. Defaults to
   * `document.body`. Used to portal the popup inside dialogs/modals so it
   * renders on top of (and clips within) the right context.
   */
  container?: string | HTMLElement
  /**
   * When `true`, a pointerdown outside both the popup and the editor dismisses
   * the suggestion. Wired up and torn down alongside the mounted element.
   */
  dismissOnOutsideClick: boolean
  /** Dismisses the active suggestion (used by outside-click handling). */
  dismiss: () => void
}

/**
 * Resolves a container option (selector or element) to a mount target,
 * falling back to `document.body` when it can't be resolved.
 */
function resolveContainer(container?: string | HTMLElement): HTMLElement {
  if (container instanceof HTMLElement) {
    return container
  }

  if (typeof container === 'string') {
    try {
      // `container` is consumer-provided; an invalid selector throws a
      // DOMException, so fall back to document.body instead of crashing.
      const found = document.querySelector<HTMLElement>(container)

      if (found) {
        return found
      }
    } catch {
      return document.body
    }
  }

  return document.body
}

/**
 * Builds the `mount` function handed to the renderer on `SuggestionProps`.
 *
 * Mounts the popup into the container, then wires Floating UI's `autoUpdate`
 * against a virtual reference that re-reads the live cursor rect, so the popup
 * stays anchored across scroll, resize, and layout shifts without the consumer
 * attaching any listeners. The returned `unmount` tears all of that down.
 */
export function createMount({
  getReferenceRect,
  contextElement,
  config,
  container,
  dismissOnOutsideClick,
  dismiss,
}: CreateMountOptions): SuggestionMount {
  return (element, options = {}) => {
    const reference: VirtualElement = {
      getBoundingClientRect: () => getReferenceRect() ?? new DOMRect(),
      contextElement,
    }

    let positioned = false

    // Mount the popup into the container (default `document.body`) unless the
    // consumer already placed it in the DOM themselves — in which case we leave
    // mounting (and unmounting) to them.
    const mountedByUs = !element.isConnected

    if (mountedByUs) {
      resolveContainer(container).appendChild(element)
    }

    // Hide the element until the first measurement resolves so it doesn't flash
    // at its initial coordinates. Skipped when the consumer owns applying the
    // position via `onPosition`.
    if (!options.onPosition) {
      element.style.visibility = 'hidden'
      element.style.width = 'max-content'
    }

    const update = () => {
      computePosition(reference, element, {
        placement: config.placement,
        strategy: config.strategy,
        middleware: config.middleware,
      }).then(({ x, y, placement, strategy }) => {
        if (options.onPosition) {
          options.onPosition({ x, y, placement: placement as SuggestionPlacement, strategy })
          return
        }

        Object.assign(element.style, {
          position: strategy,
          left: `${x}px`,
          top: `${y}px`,
        })

        if (!positioned) {
          positioned = true
          element.style.visibility = ''
        }
      })
    }

    const cleanupAutoUpdate = autoUpdate(reference, element, update, options.autoUpdate)

    // Dismiss when the user interacts outside both the popup and the editor.
    // Capture phase so a parent that stops propagation can't swallow it.
    let onOutsidePointerDown: ((event: PointerEvent) => void) | undefined

    if (dismissOnOutsideClick) {
      onOutsidePointerDown = event => {
        const target = event.target

        if (
          !(target instanceof Node) ||
          element.contains(target) ||
          contextElement.contains(target)
        ) {
          return
        }

        dismiss()
      }

      document.addEventListener('pointerdown', onOutsidePointerDown, true)
    }

    return () => {
      cleanupAutoUpdate()

      if (onOutsidePointerDown) {
        document.removeEventListener('pointerdown', onOutsidePointerDown, true)
      }

      if (mountedByUs) {
        element.remove()
      }
    }
  }
}

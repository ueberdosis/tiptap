import type { Transaction } from '@tiptap/pm/state'
import type { Decoration, DecorationSet } from '@tiptap/pm/view'

import type { InlineDecoration, NodeDecoration, WidgetDecoration } from '../types.js'

/**
 * Finds removed and added decorations from one decoration set to the next
 * and removes/adds them on the old decoration set - returns the updated old decoration set
 * check is done by new mapped position & specs
 * @param transaction The transaction to apply
 * @param oldDecorationSet The old decoration set
 * @param newDecorationSet The new decoration set
 */
export function findDecoUpdates(
  tr: Transaction,
  oldDecorationSet: DecorationSet,
  newDecorationSet: DecorationSet,
): DecorationSet {
  // map the old decoration to the updated positions
  let mappedOldDecorations = oldDecorationSet.map(tr.mapping, tr.doc)

  const oldDecorations = mappedOldDecorations.find()
  const newDecorations = newDecorationSet.find()

  const decosToRemove: Decoration[] = []
  const decosToAdd: Decoration[] = []

  // Cache for decoration identities to avoid recomputation
  const identityCache = new WeakMap<Decoration, string>()

  // helper to compute an identity for a decoration's spec
  function decoIdentity(deco: Decoration): string {
    // Check cache first
    const cached = identityCache.get(deco)
    if (cached !== undefined) {
      return cached
    }

    let identity: string

    try {
      const attrs = (deco as any).attributes ?? (deco as any).attrs ?? {}
      const spec = deco.spec || {}

      // Build identity from key parts without JSON.stringify for performance
      const parts: string[] = []

      // Add spec properties that are commonly used for identity
      if ((spec as any).key !== undefined) {
        parts.push(`k:${String((spec as any).key)}`)
      }
      if ((spec as any).display !== undefined) {
        parts.push(`d:${String((spec as any).display)}`)
      }
      if ((spec as any).extension !== undefined) {
        parts.push(`e:${String((spec as any).extension)}`)
      }
      if ((spec as any).name !== undefined) {
        parts.push(`n:${String((spec as any).name)}`)
      }

      // Add stringified attrs if they exist
      const attrKeys = Object.keys(attrs)
      if (attrKeys.length > 0) {
        parts.push(
          `a:${attrKeys
            .sort()
            .map(k => `${k}=${attrs[k]}`)
            .join(',')}`,
        )
      }

      // If spec has other properties, fall back to JSON.stringify for those
      const specKeys = Object.keys(spec).filter(
        k => k !== 'key' && k !== 'display' && k !== 'extension' && k !== 'name',
      )
      if (specKeys.length > 0) {
        try {
          const otherSpec = Object.fromEntries(specKeys.map(k => [k, (spec as any)[k]]))
          parts.push(`s:${JSON.stringify(otherSpec)}`)
        } catch {
          // Ignore JSON errors for circular structures
          parts.push(`s:${specKeys.join(',')}`)
        }
      }

      identity = parts.length > 0 ? parts.join('|') : ''
    } catch {
      identity = String(deco.spec?.key ?? deco.spec?.display ?? deco.spec?.extension ?? '')
    }

    // Cache the result
    identityCache.set(deco, identity)
    return identity
  }

  // lets find decorations on the old decorations that are not in the new decorations
  oldDecorations.forEach(oldDeco => {
    const oldId = decoIdentity(oldDeco)

    const isSame = newDecorations.some(newDeco => {
      const newId = decoIdentity(newDeco)
      const same = oldDeco.from === newDeco.from && oldDeco.to === newDeco.to && oldId === newId
      return same
    })

    if (!isSame) {
      decosToRemove.push(oldDeco)
    }
  })

  // lets find new decorations that are not in the old decorations
  newDecorations.forEach(newDeco => {
    const newId = decoIdentity(newDeco)

    const isSame = oldDecorations.some(oldDeco => {
      const oldId = decoIdentity(oldDeco)
      return oldDeco.from === newDeco.from && oldDeco.to === newDeco.to && oldId === newId
    })

    if (!isSame) {
      decosToAdd.push(newDeco)
    }
  })

  if (decosToRemove.length > 0) {
    mappedOldDecorations = mappedOldDecorations.remove(decosToRemove)
  }

  if (decosToAdd.length > 0) {
    mappedOldDecorations = mappedOldDecorations.add(tr.doc, decosToAdd)
  }

  return mappedOldDecorations
}

/**
 * Creates an inline decoration item. Useful for highlighting text, adding backgrounds, or text formatting.
 *
 * @param from - Start position in the document
 * @param to - End position in the document
 * @param attributes - HTML attributes to apply (e.g., class names or styles)
 * @returns An inline decoration item
 *
 * @example
 * ```ts
 * createInlineDecoration(5, 10, { class: 'highlight' })
 * ```
 */
export function createInlineDecoration(
  from: number,
  to: number,
  attributes?: Record<string, string>,
): InlineDecoration {
  return {
    type: 'inline',
    from,
    to,
    attributes,
  }
}

/**
 * Creates a node decoration item. Useful for styling entire blocks like code blocks, headings, or quotes.
 *
 * @param from - Start position in the document
 * @param to - End position in the document
 * @param attributes - HTML attributes to apply (e.g., class names or styles)
 * @returns A node decoration item
 *
 * @example
 * ```ts
 * createNodeDecoration(0, 50, { class: 'my-block' })
 * ```
 */
export function createNodeDecoration(from: number, to: number, attributes?: Record<string, string>): NodeDecoration {
  return {
    type: 'node',
    from,
    to,
    attributes,
  }
}

/**
 * Creates a widget decoration item. Widgets render custom HTML at a specific position in the document.
 *
 * @param at - Position in the document to place the widget
 * @param widget - Function that creates the widget DOM element
 * @returns A widget decoration item
 *
 * @example
 * ```ts
 * createWidgetDecoration(10, (view, getPos) => {
 *   const el = document.createElement('span')
 *   el.textContent = '⭐'
 *   return el
 * })
 * ```
 */
export function createWidgetDecoration(
  at: number,
  widget: (view: any, getPos: () => number | undefined) => HTMLElement,
): WidgetDecoration {
  return {
    type: 'widget',
    from: at,
    to: at,
    widget,
  }
}

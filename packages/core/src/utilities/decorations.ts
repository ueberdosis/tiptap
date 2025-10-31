import type { Transaction } from '@tiptap/pm/state'
import type { Decoration, DecorationSet } from '@tiptap/pm/view'

import type { InlineDecoration, NodeDecoration, WidgetDecoration } from '../types'

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

  // helper to compute an identity for a decoration's spec
  function decoIdentity(deco: Decoration) {
    try {
      const attrs = (deco as any).attributes ?? (deco as any).attrs ?? {}
      const spec = deco.spec || {}
      // avoid throwing from circular structures
      try {
        const id = JSON.stringify({ spec, attrs })
        return id
      } catch {
        // fallback to a simpler representation
        return `${String((spec as any).key ?? (spec as any).display ?? (spec as any).extension ?? '')}::${JSON.stringify(attrs)}`
      }
    } catch {
      return String(deco.spec?.key ?? deco.spec?.display ?? deco.spec?.extension ?? '')
    }
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

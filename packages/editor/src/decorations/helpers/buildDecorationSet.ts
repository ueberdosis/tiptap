import type { Node } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'

import type { Decoration } from '../Decoration.js'
import { decorationsToPMDecorations } from './decorationsToPMDecorations.js'

/**
 * Builds a DecorationSet from a list of decorations.
 * @param doc The document to build the decoration set for.
 * @param decorations The decorations to build the set from.
 * @param extensionName The name of the extension that created the decorations.
 * @returns The built decoration set and the widget keys.
 */
export function buildDecorationSet(
  doc: Node,
  decorations: Decoration[],
  extensionName?: string,
): { set: DecorationSet; widgetKeys: Set<string> } {
  const { decorations: pmDecorations, widgetKeys } = decorationsToPMDecorations(
    decorations,
    extensionName,
  )

  return { set: DecorationSet.create(doc, pmDecorations), widgetKeys }
}

import { Decoration as PMDecoration } from '@tiptap/pm/view'

import type { Decoration, WidgetDecoration } from '../Decoration.js'

/**
 * Converts a list of decorations to ProseMirror decorations.
 * @param decorations The decorations to convert.
 * @param extensionName The name of the extension that created the decorations.
 * @returns The converted decorations and the widget keys.
 */
export function decorationsToPMDecorations(
  decorations: Decoration[],
  extensionName?: string,
): {
  decorations: PMDecoration[]
  widgetKeys: Set<string>
} {
  const pmDecorations: PMDecoration[] = []
  const widgetKeys = new Set<string>()

  for (const decoration of decorations) {
    if (decoration.kind === 'widget') {
      const { key } = decoration as WidgetDecoration

      if (widgetKeys.has(key)) {
        console.warn(
          `[tiptap warn]: Duplicate widget decoration key "${key}"` +
            (extensionName ? ` in extension "${extensionName}"` : '') +
            '. Widget decoration keys must be globally unique, otherwise ProseMirror ' +
            'misplaces the widget DOM. Use a stable, unique key (e.g. `comment-${id}`).',
        )
      }

      widgetKeys.add(key)
    }

    pmDecorations.push(decoration.toPMDecoration(extensionName))
  }

  return { decorations: pmDecorations, widgetKeys }
}

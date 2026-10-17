import { Decoration as PMDecoration } from '@tiptap/pm/view'

import type { Decoration, WidgetDecoration } from '../Decoration.js'

function isWidgetDecoration(decoration: Decoration): decoration is WidgetDecoration {
  return decoration.kind === 'widget'
}

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
      if (isWidgetDecoration(decoration)) {
        widgetKeys.add(decoration.key)
      }
    }

    pmDecorations.push(decoration.toPMDecoration(extensionName))
  }

  return { decorations: pmDecorations, widgetKeys }
}

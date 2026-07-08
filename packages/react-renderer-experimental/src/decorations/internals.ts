import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationAttrs, DecorationSource, EditorView } from '@tiptap/pm/view'

/**
 * Non-public `prosemirror-view` decoration internals this renderer relies
 * on. All are stripped from the published type declarations (`@internal`)
 * but stable in the pinned 1.41.9 (see AUDIT.md); every access goes through
 * the helpers below so the private surface stays in one module.
 *
 * - `Decoration.inline` / `Decoration.widget`: discriminate the three
 *   decoration kinds (`decoration.ts` L238/L241). Invariant: exactly one of
 *   widget/inline is true for non-node decorations.
 * - `Decoration.type.side`: a widget's `side` (WidgetType constructor).
 * - `Decoration.type.attrs`: an inline/node decoration's attributes.
 * - `Decoration.type.spec`: the widget spec (key, stopEvent, destroy, …).
 * - `Decoration.type.toDOM`: a widget's DOM node or factory.
 * - `Decoration.type.eq`: structural type equality, used by `matchesWidget`.
 * - `DecorationSource.locals(node)`: the decorations local to a node, sorted
 *   and overlap-free — the input `iterDeco` walks.
 */
interface DecorationInternals {
  inline: boolean
  widget: boolean
  type: {
    side?: number
    attrs?: DecorationAttrs
    spec?: Record<string, unknown>
    toDOM?: Node | ((view: EditorView, getPos: () => number | undefined) => Node)
    eq(other: unknown): boolean
  }
}

export const decorationInternals = (decoration: Decoration): DecorationInternals =>
  decoration as unknown as DecorationInternals

export const isWidget = (decoration: Decoration): boolean => decorationInternals(decoration).widget

export const isInline = (decoration: Decoration): boolean => decorationInternals(decoration).inline

export const widgetSide = (decoration: Decoration): number =>
  decorationInternals(decoration).type.side ?? 0

export const decorationAttrs = (decoration: Decoration): DecorationAttrs =>
  decorationInternals(decoration).type.attrs ?? {}

export const sourceLocals = (
  source: DecorationSource,
  node: ProseMirrorNode,
): readonly Decoration[] =>
  (source as unknown as { locals(node: ProseMirrorNode): readonly Decoration[] }).locals(node)

export const sourceEq = (source: DecorationSource, other: DecorationSource): boolean =>
  (source as unknown as { eq(other: DecorationSource): boolean }).eq(other)

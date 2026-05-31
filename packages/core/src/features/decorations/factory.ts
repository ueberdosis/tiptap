import { DecorationAttrs } from '@tiptap/pm/view'

import type {
  InlineDecorationDescriptor,
  NodeDecorationDescriptor,
  WidgetDecorationDescriptor,
} from './types.js'

/**
 * Factory helpers for building framework-agnostic decoration descriptors
 * returned from an extension's `addDecorations().create()`.
 *
 * @example
 * addDecorations() {
 *   return {
 *     create: ({ state }) =>
 *       findChildren(state.doc, node => node.type.name === 'heading').map(
 *         ({ pos, node }) =>
 *           decoration.node(pos, pos + node.nodeSize, { class: 'is-heading' }),
 *       ),
 *   }
 * }
 */
export const decoration = {
  /**
   * Decorate a single node (adds attributes to the node's DOM wrapper).
   */
  node(
    from: number,
    to: number,
    attrs: DecorationAttrs = {},
    spec?: Record<string, any>,
  ): NodeDecorationDescriptor {
    return { kind: 'node', from, to, attrs, spec }
  },

  /**
   * Decorate a range of inline content (wraps the text in a styled span).
   */
  inline(
    from: number,
    to: number,
    attrs: DecorationAttrs = {},
    spec?: Record<string, any>,
  ): InlineDecorationDescriptor {
    return { kind: 'inline', from, to, attrs, spec }
  },

  /**
   * Insert a widget (a DOM node rendered at a position). A stable `key` is
   * required so ProseMirror can reuse the widget's DOM across updates instead
   * of recreating it — see {@link WidgetDecorationDescriptor.key}.
   */
  widget(
    pos: number,
    render: WidgetDecorationDescriptor['render'],
    options: { key: string } & NonNullable<WidgetDecorationDescriptor['spec']>,
  ): WidgetDecorationDescriptor {
    const { key, ...spec } = options

    return { kind: 'widget', pos, render, key, spec }
  },
}

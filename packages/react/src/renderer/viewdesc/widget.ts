/** Decoration widget — has no PM node, identified by the `widget` field. */

import type { TagParseRule } from '@tiptap/pm/model'
import type { Decoration } from '@tiptap/pm/view'

import { ReactViewDesc } from './base.js'
import { type DOMNode, NOT_DIRTY } from './types.js'

export class ReactWidgetViewDesc extends ReactViewDesc {
  constructor(
    parent: ReactViewDesc | undefined,
    public readonly widget: Decoration,
    dom: DOMNode,
  ) {
    super(parent, [], dom, null)
  }

  override matchesWidget(widget: Decoration): boolean {
    return this.dirty === NOT_DIRTY && this.widget === widget
  }

  override parseRule(): Omit<TagParseRule, 'tag'> | null {
    return { ignore: true }
  }

  override get domAtom(): boolean {
    return true
  }

  /** Widget binding side: negative = bind to previous pos, non-negative = next. */
  override get widgetSide(): number {
    return (this.widget as unknown as { type: { side: number } }).type.side
  }

  override get ignoreForSelection(): boolean {
    return Boolean((this.widget.spec as { ignoreSelection?: boolean }).ignoreSelection)
  }
}

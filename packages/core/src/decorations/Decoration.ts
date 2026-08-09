import type { Mark } from '@tiptap/pm/model'
import { DecorationAttrs, Decoration as PMDecoration, type EditorView } from '@tiptap/pm/view'

export interface WidgetDecorationOptions {
  side?: number
  relaxedSide?: boolean
  marks?: readonly Mark[]
  stopEvent?: (event: Event) => boolean
  ignoreSelection?: boolean
  /**
   * runs when ProseMirror drops the widget, also on editor destroy and unmount.
   * skipped on teardown for widgets made with the React or Vue widget renderer.
   * receives the DOM node, not a ProseMirror node.
   */
  destroy?: (node: globalThis.Node) => void
}

export type DecorationKind = 'inline' | 'node' | 'widget'

/**
 * Base class for decorations built in `addDecorations()`. Shadows `Decoration`
 * from `@tiptap/pm/view`, like core's `Node` and `Mark` do, so alias one of them
 * in files that need both.
 *
 * @example
 * import { Decoration } from '@tiptap/core'
 * import { Decoration as PMDecoration } from '@tiptap/pm/view'
 *
 * const highlight = Decoration.Inline(1, 5, { class: 'highlight' })
 */
export abstract class Decoration {
  abstract kind: DecorationKind
  abstract get anchor(): number

  /**
   * Builds the ProseMirror decoration. When `extensionName` is provided,
   * it is embedded into the decoration spec for incremental merge tracking.
   * @param extensionName The name of the extension that produced this decoration.
   * @returns The ProseMirror decoration.
   */
  abstract toPMDecoration(extensionName?: string): PMDecoration

  static Inline(
    from: number,
    to: number,
    attrs: DecorationAttrs = {},
    spec?: Record<string, any>,
  ): InlineDecoration {
    return new InlineDecoration(from, to, attrs, spec)
  }

  static Node(
    pos: number,
    to: number,
    attrs: DecorationAttrs = {},
    spec?: Record<string, any>,
  ): NodeDecoration {
    return new NodeDecoration(pos, to, attrs, spec)
  }

  /**
   * Creates a widget decoration: a DOM node drawn at a document position.
   *
   * The `key` is the widget's identity. While it stays the same, ProseMirror
   * keeps the widget mounted and only its position tracks the document.
   * `render`, `side`, `destroy` and other options are fixed on first mount.
   * Change the key to remount with new options.
   *
   * @param pos The document position where the widget is drawn.
   * @param render Called once on first mount. Returns the DOM node.
   * @param options Must include a unique `key`. See `WidgetDecorationOptions`.
   * @returns The widget decoration.
   */
  static Widget(
    pos: number,
    render: (view: EditorView, getPos: () => number | undefined) => HTMLElement,
    options: { key: string } & WidgetDecorationOptions & Record<string, any>,
  ): WidgetDecoration {
    const { key, ...spec } = options

    return new WidgetDecoration(pos, render, key, spec)
  }
}

/**
 * Represents an inline decoration (text-level highlighting, etc.).
 */
export class InlineDecoration extends Decoration {
  kind = 'inline' as const
  from: number
  to: number
  attrs: DecorationAttrs
  spec?: Record<string, any>

  constructor(from: number, to: number, attrs: DecorationAttrs = {}, spec?: Record<string, any>) {
    super()
    this.from = from
    this.to = to
    this.attrs = attrs
    this.spec = spec
  }

  get anchor(): number {
    return this.from
  }

  toPMDecoration(extensionName?: string): PMDecoration {
    const spec = extensionName ? { ...this.spec, extensionName } : this.spec

    return PMDecoration.inline(this.from, this.to, this.attrs, spec)
  }
}

/**
 * Represents a node-level decoration (block-level highlights, etc.).
 */
export class NodeDecoration extends Decoration {
  kind = 'node' as const
  from: number
  to: number
  attrs: DecorationAttrs
  spec?: Record<string, any>

  constructor(pos: number, to: number, attrs: DecorationAttrs = {}, spec?: Record<string, any>) {
    super()
    this.from = pos
    this.to = to
    this.attrs = attrs
    this.spec = spec
  }

  get anchor(): number {
    return this.from
  }

  toPMDecoration(extensionName?: string): PMDecoration {
    const spec = extensionName ? { ...this.spec, extensionName } : this.spec

    return PMDecoration.node(this.from, this.to, this.attrs, spec)
  }
}

/**
 * Represents a widget decoration (inline widgets, etc.).
 */
export class WidgetDecoration extends Decoration {
  kind = 'widget' as const
  pos: number
  key: string
  render: (view: EditorView, getPos: () => number | undefined) => HTMLElement
  spec?: WidgetDecorationOptions & Record<string, any>

  constructor(
    pos: number,
    render: (view: EditorView, getPos: () => number | undefined) => HTMLElement,
    key: string,
    spec?: WidgetDecorationOptions & Record<string, any>,
  ) {
    super()
    this.pos = pos
    this.render = render
    this.key = key
    this.spec = spec
  }

  get anchor(): number {
    return this.pos
  }

  toPMDecoration(extensionName?: string): PMDecoration {
    const spec = extensionName
      ? { ...this.spec, key: this.key, extensionName }
      : { ...this.spec, key: this.key }

    return PMDecoration.widget(this.pos, this.render, spec)
  }
}

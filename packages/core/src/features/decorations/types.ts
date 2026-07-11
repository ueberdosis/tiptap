import type { Mark } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { DecorationAttrs, EditorView } from '@tiptap/pm/view'

import type { Editor } from '../../Editor.js'

/**
 * Decorations are **view-only** markers attached to positions or ranges in the
 * document. They are not serialized into JSON/HTML and they do not modify the
 * underlying ProseMirror document.
 *
 * Use decorations for:
 * - highlights and search results
 * - comments / annotations
 * - temporary UI markers
 * - lightweight widgets that do not represent persisted document structure
 *
 * Use {@link NodeView | NodeViews} for:
 * - persisted custom document content
 * - editable custom blocks
 * - complex embedded UI that owns document structure
 *
 * @see https://prosemirror.net/docs/ref/#view.Decoration
 */

export interface NodeDecorationDescriptor {
  kind: 'node'
  from: number
  to: number
  attrs: DecorationAttrs
  spec?: Record<string, any>
}
export interface InlineDecorationDescriptor {
  kind: 'inline'
  from: number
  to: number
  attrs: DecorationAttrs
  spec?: Record<string, any>
}

/**
 * ProseMirror options that control how a widget behaves in the editor view.
 * The renderer helpers expose these options so framework widgets do not need
 * to drop down to the low-level `decoration.widget()` factory.
 */
export interface WidgetDecorationOptions {
  /** Controls which side of the position the widget is associated with. */
  side?: number
  /** Allows the DOM selection to remain on either side of the widget. */
  relaxedSide?: boolean
  /** The marks to render around the widget. */
  marks?: readonly Mark[]
  /** Prevents selected DOM events from being handled by ProseMirror. */
  stopEvent?: (event: Event) => boolean
  /** Prevents selection changes inside the widget from being synced by ProseMirror. */
  ignoreSelection?: boolean
  /** Runs when ProseMirror removes the widget or destroys the editor. */
  destroy?: (node: Node) => void
}

export interface WidgetDecorationDescriptor {
  kind: 'widget'
  pos: number
  render: (view: EditorView, getPos: () => number | undefined) => HTMLElement
  /**
   * A stable, position-independent identifier for this widget.
   *
   * ProseMirror reuses a widget's DOM across redraws only when this `key`
   * matches the previous render. Without a stable key the widget is destroyed
   * and recreated on every update, causing flicker and lost component state.
   *
   * **Good keys** (stable, domain-based):
   * - `comment-${id}` — a persisted comment
   * - `paragraph-${node.attrs.id}` — using a node attribute as identity
   * - `suggestion-${id}` — a suggestion annotation
   *
   * **Bad keys** (unstable, position-dependent):
   * - `${currentIndex}` — a loop/paragraph index (shifts when content changes)
   * - `marker-${from}` — a document position (changes on every edit)
   * - `widget-${pos}` — any position-derived value
   *
   * For stateless widgets in demos or examples, index-based or position-based
   * keys are acceptable, but stateful widgets must always use stable keys
   * to preserve component state across edits.
   *
   * **Uniqueness**: Keys must also be globally unique across all widget
   * decorations in the editor. Duplicate keys cause ProseMirror to misplace
   * the widget DOM and crash. If you need two widgets for the same entity,
   * include a suffix (e.g. `comment-${id}-start`, `comment-${id}-end`).
   */
  key: string
  spec?: WidgetDecorationOptions & Record<string, any>
}
export type DecorationDescriptor =
  | NodeDecorationDescriptor
  | InlineDecorationDescriptor
  | WidgetDecorationDescriptor

/**
 * The context passed to `create` when an extension builds its decorations.
 * `view` is the live editor view; it is always available because decorations
 * are only computed once the editor is mounted.
 */
export interface DecorationCreateProps {
  editor: Editor
  state: EditorState
  view: EditorView
}

/**
 * The context passed to `shouldUpdate` to decide whether an extension's
 * decorations need to be recomputed for the given transaction.
 */
export interface DecorationShouldUpdateProps {
  editor: Editor
  tr: Transaction
  oldState: EditorState
  newState: EditorState
}

/**
 * The context passed to `createInRange` when an extension rebuilds only the
 * decorations within a changed range. Identical to {@link DecorationCreateProps}
 * but bounded by `from`/`to`. The range is aligned to the enclosing top-level
 * block(s) the edit touched, so a match that straddles the raw edit is still
 * fully contained.
 */
export interface DecorationRangeProps extends DecorationCreateProps {
  from: number
  to: number
}

/**
 * Fields shared by every `addDecorations` descriptor, regardless of whether it
 * opts into incremental recomputation.
 */
export interface BaseDecorationSpec {
  /**
   * Build the full set of this extension's decorations from the current state.
   * Used for the initial build and for forced `updateDecorations()`.
   */
  create: (props: DecorationCreateProps) => DecorationDescriptor[]
  /**
   * Gate recomputation for performance. Return `false` to keep the existing
   * decorations mapped through the transaction instead of rebuilding them.
   * Defaults to recomputing whenever the document changes (`tr.docChanged`).
   *
   * Return `false` for transactions that cannot affect the decorations, such
   * as selection-only changes. For large documents, consider
   * `incrementalCreate` when each decoration depends only on its own block.
   *
   * `shouldUpdate` decides *whether* to recompute; `incrementalCreate` decides
   * *how*. If your `create()` performs expensive work (e.g. full-document scans,
   * regex matching, external API calls), either provide a `shouldUpdate` that
   * only returns `true` when the relevant part of the document actually changed,
   * or opt into incremental recomputation (see {@link IncrementalDecorationSpec}).
   */
  shouldUpdate?: (props: DecorationShouldUpdateProps) => boolean
}

/**
 * The default descriptor: every document change rebuilds the whole set with
 * `create`. Always correct; can be expensive on large documents.
 */
export interface NonIncrementalDecorationSpec extends BaseDecorationSpec {
  incrementalCreate?: false
  createInRange?: never
}

/**
 * Opts into incremental recomputation. On a document change the manager maps the
 * existing decorations forward and rebuilds only the changed ranges via
 * `createInRange`, instead of rebuilding everything with `create`. `create` is
 * still used for the initial build and for forced `updateDecorations()`.
 *
 * **Only correct when each decoration depends solely on the content within its
 * own range/block.** For decorations that depend on the whole document — ordinal
 * counts ("highlight the first match"), cross-document relationships ("mark
 * duplicate words"), or selection/external state — leave this off and rely on
 * `create`, or trigger a full rebuild with `updateDecorations()`.
 *
 * @experimental The incremental API (`incrementalCreate` / `createInRange`) is
 * experimental. Its semantics, the way changed ranges are computed, and the
 * naming may change in a minor release while it stabilizes. The non-incremental
 * `create` / `shouldUpdate` API is stable.
 */
export interface IncrementalDecorationSpec extends BaseDecorationSpec {
  /**
   * Set to `true` to opt into incremental recomputation. Requires
   * {@link IncrementalDecorationSpec.createInRange}.
   *
   * @experimental
   */
  incrementalCreate: true
  /**
   * Build this extension's decorations for the given range only. Receives the
   * block-aligned changed range as `from`/`to`.
   *
   * **Contract:** return only decorations whose anchor position (`from` for
   * inline/node decorations, `pos` for widgets) lies within `[from, to)`.
   * Decorations outside this range are ignored. Use `create` when a decoration
   * depends on content outside the range.
   *
   * @experimental
   */
  createInRange: (props: DecorationRangeProps) => DecorationDescriptor[]
}

/**
 * The descriptor returned from an extension's `addDecorations`.
 */
export type DecorationSpec = NonIncrementalDecorationSpec | IncrementalDecorationSpec

/**
 * Transaction metadata understood by the decoration manager. Used by the
 * `updateDecorations` command.
 */
export type DecorationMeta = { type: 'force'; name?: string }

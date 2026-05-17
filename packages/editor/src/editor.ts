import { type EditorOptions, type Extensions, Editor as CoreEditor, flattenExtensions } from '@tiptap/core'

import { Document } from './nodes/document.js'
import { Paragraph } from './nodes/paragraph.js'
import { Text } from './nodes/text.js'

const CORE_NODE_NAMES = new Set(['doc', 'paragraph', 'text'])

/**
 * Compose a user-supplied extensions list with Document, Paragraph, and Text
 * as default extensions. Any extension already present in the list — whether
 * at the top level or nested inside a kit's `addExtensions()` — that uses
 * the name `doc`, `paragraph`, or `text` causes the matching default to be
 * skipped, preserving advanced schema customization.
 *
 * @param extensions The extensions list passed by the consumer.
 * @returns A new top-level extensions list with the core nodes guaranteed
 *   to be present at least once across the resolved extension tree.
 * @example
 * ```ts
 * const exts = withDefaultCoreNodes([Heading]) // [Document, Paragraph, Text, Heading]
 * ```
 */
export function withDefaultCoreNodes(extensions: Extensions = []): Extensions {
  // Walk into kits (e.g. StarterKit) so we don't double-register a node
  // the consumer already gets through a bundle.
  const resolvedNames = new Set<string>()
  const collectName = (ext: unknown) => {
    const name = (ext as { name?: string } | null | undefined)?.name
    if (typeof name === 'string' && CORE_NODE_NAMES.has(name)) {
      resolvedNames.add(name)
    }
  }
  try {
    flattenExtensions(extensions).forEach(collectName)
  } catch {
    // If a kit's addExtensions() throws during pre-flatten (e.g. it needs
    // editor context), fall back to a shallow check rather than crash.
    extensions.forEach(collectName)
  }

  const defaults: Extensions = []
  if (!resolvedNames.has('doc')) {
    defaults.push(Document)
  }
  if (!resolvedNames.has('paragraph')) {
    defaults.push(Paragraph)
  }
  if (!resolvedNames.has('text')) {
    defaults.push(Text)
  }

  return [...defaults, ...extensions]
}

/**
 * The default Editor for `@tiptap/editor`.
 *
 * Behaves identically to the underlying `@tiptap/core` Editor, but
 * automatically registers Document, Paragraph, and Text so a basic editor
 * works without explicitly adding them.
 *
 * Override any of the three by passing a custom node with the same `name`
 * (`doc`, `paragraph`, or `text`) in the `extensions` array. To opt out of
 * the defaults entirely, import the underlying Editor from `@tiptap/core`.
 *
 * @example
 * ```ts
 * import { Editor } from '@tiptap/editor'
 *
 * const editor = new Editor({ content: '<p>Hello world</p>' })
 * ```
 *
 * @example Replacing a default
 * ```ts
 * import { Editor } from '@tiptap/editor'
 * import { Paragraph } from '@tiptap/editor/nodes/paragraph'
 *
 * const CustomParagraph = Paragraph.extend({
 *   addAttributes() {
 *     return { variant: { default: 'body' } }
 *   },
 * })
 *
 * const editor = new Editor({ extensions: [CustomParagraph] })
 * ```
 */
export class Editor extends CoreEditor {
  constructor(options: Partial<EditorOptions> = {}) {
    super({
      ...options,
      extensions: withDefaultCoreNodes(options.extensions),
    })
  }
}

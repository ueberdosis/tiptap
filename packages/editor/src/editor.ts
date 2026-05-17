import { type EditorOptions, type Extensions, Editor as CoreEditor } from '@tiptap/core'

import { Document } from './nodes/document.js'
import { Paragraph } from './nodes/paragraph.js'
import { Text } from './nodes/text.js'

const CORE_NODE_NAMES = new Set(['doc', 'paragraph', 'text'])

/**
 * Compose a user-supplied extensions list with Document, Paragraph, and Text
 * as default extensions. Any user extension whose `name` matches one of
 * `doc`, `paragraph`, or `text` will replace the corresponding default,
 * preserving advanced schema customization.
 *
 * @param extensions The extensions list passed by the consumer.
 * @returns A new extensions list with the core nodes guaranteed to be present.
 * @example
 * ```ts
 * const exts = withDefaultCoreNodes([Heading]) // [Document, Paragraph, Text, Heading]
 * ```
 */
export function withDefaultCoreNodes(extensions: Extensions = []): Extensions {
  const presentCoreNames = new Set(
    extensions
      .map(extension => (extension as { name?: string }).name)
      .filter((name): name is string => typeof name === 'string' && CORE_NODE_NAMES.has(name)),
  )

  const defaults: Extensions = []

  if (!presentCoreNames.has('doc')) {
    defaults.push(Document)
  }

  if (!presentCoreNames.has('paragraph')) {
    defaults.push(Paragraph)
  }

  if (!presentCoreNames.has('text')) {
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

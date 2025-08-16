// Types used by the Core markdown subsystem.
import type { JSONContent, MarkType } from '../types.js'

/**
 * A small hint used by extensions to declare tokenizer behavior.
 */
export interface MarkdownTokenizerHint {
  /** Optional explicit tokenizer name used to tag tokens. */
  name?: string
  /** RegExp used by the tokenizer to detect occurrences. */
  match?: RegExp
  /** Optional parse function called with the RegExp match. */
  parse?: (match: RegExpExecArray) => any
}

/**
 * The value an extension parse handler can return.
 * - A single `JSONContent` node
 * - An array of `JSONContent` nodes
 * - A wrapper `{ mark, content }` where `content` is an array of nodes and
 *   `mark` is a mark descriptor to apply to the content.
 */
export type MarkdownParseResult = JSONContent | JSONContent[] | { mark: MarkType; content: JSONContent[] }

/**
 * A small, common subset of token fields produced by the baseline lexer
 * (e.g. `marked`). Extensions can rely on these fields when implementing
 * `parse` handlers. Implementations may include additional fields.
 */
export type MarkdownToken = {
  type?: string
  raw?: string
  text?: string
  tokens?: MarkdownToken[]
  [key: string]: any
}

export interface MarkdownSerializerOptions {
  // placeholder for future serializer options
  [key: string]: any
}

/**
 * The shape that can be added to an Extension's `config.markdown`.
 */
export interface MarkdownExtensionConfig extends Partial<MarkdownTokenizerHint> {
  parse?: (token: any) => MarkdownParseResult | Promise<MarkdownParseResult>
  render?: (node: JSONContent) => string | Promise<string>
}

export default MarkdownParseResult

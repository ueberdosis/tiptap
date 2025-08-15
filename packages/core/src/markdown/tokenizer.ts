/**
 * Optional override for the markdown parser/tokenizer builder.
 *
 * When set, `buildTokenizerForExtensions` will delegate to the injected
 * parser implementation instead of using the built-in (lazy-loaded)
 * tokenizer based on `marked`.
 *
 * This is primarily an escape-hatch used by advanced consumers or tests
 * that want to provide a custom tokenizer implementation.
 *
 * Example:
 * ```ts
 * setMarkdownParser({ build: (extensions, options) => customBuilder })
 * ```
 *
 * @param parser - An object that exposes a `build(extensions, options)` method
 *                 which returns an object with a `tokenize(markdown)` method.
 */
let customParser: any = null

export function setMarkdownParser(parser: any) {
  customParser = parser
}

/**
 * Describes a small custom tokenizer derived from an extension.
 *
 * - `name` is an identifying string used to tag generated tokens.
 * - `match` is a RegExp used to find occurrences of the custom syntax.
 * - `parse` is an optional function called with the RegExp match and
 *   should return a token-like object (e.g. { type, raw, text, ... }).
 */
type CustomTokenizer = {
  name: string
  match: RegExp
  parse?: (match: RegExpExecArray) => any
}

/**
 * Find the earliest (left-most) match across multiple custom tokenizers.
 *
 * The function executes each tokenizer's `match` RegExp against `text` and
 * returns a small object containing the index, tokenizer reference, and the
 * RegExpExecArray for the earliest match. If no tokenizer matches, returns
 * `null`.
 *
 * Important notes:
 * - Tokenizer regexes may be global; this function resets `lastIndex` after
 *   each exec() so repeated calls behave predictably.
 * - This helper is synchronous and optimized for short inline scans; for
 *   extremely large text blobs consider chunking.
 *
 * @param text - The input string to search.
 * @param tokenizers - Array of `CustomTokenizer` definitions to test.
 * @returns An object with `{ idx, tokenizer, match }` or `null` if none matched.
 */
function findEarliestMatch(
  text: string,
  tokenizers: CustomTokenizer[],
): { idx: number; tokenizer: CustomTokenizer; match: RegExpExecArray } | null {
  let earliest: { idx: number; tokenizer: CustomTokenizer; match: RegExpExecArray } | null = null

  tokenizers.forEach(tk => {
    const m = tk.match.exec(text)
    if (m) {
      const index = m.index
      if (!earliest || index < earliest.idx) {
        earliest = { idx: index, tokenizer: tk, match: m }
      }
    }
    // reset lastIndex for global regexes
    tk.match.lastIndex = 0
  })

  return earliest
}

/**
 * Process a plain text string by running all registered custom tokenizers on it.
 *
 * This function walks the input text left-to-right and emits an array of
 * token-like objects. Segments that don't match any custom tokenizer are
 * emitted as `{ type: 'text', raw, text }` objects. When a tokenizer matches,
 * this function will call its `parse` (if provided) to create a richer token
 * or fall back to a minimal token object with `type`, `raw`, and `text`.
 *
 * Example output:
 * ```js
 * [ { type: 'text', text: 'Hello ' }, { type: 'mention', text: '@alice' }, ... ]
 * ```
 *
 * @param text - The input text to scan.
 * @param tokenizers - Array of `CustomTokenizer` instances.
 * @returns An array of token-like objects produced from the input.
 */
function processTextWithTokenizers(text: string, tokenizers: CustomTokenizer[]) {
  const parts: any[] = []
  let remaining = String(text)

  while (remaining.length) {
    const hit = findEarliestMatch(remaining, tokenizers)
    if (!hit) {
      parts.push({ type: 'text', raw: remaining, text: remaining })
      break
    }

    const { idx, tokenizer, match } = hit as { idx: number; tokenizer: CustomTokenizer; match: RegExpExecArray }
    if (idx > 0) {
      parts.push({ type: 'text', raw: remaining.slice(0, idx), text: remaining.slice(0, idx) })
    }

    // Allow tokenizer.parse to return a richer token object. Ensure required
    // fields exist so the parser can reliably match by `type`.
    const produced = tokenizer.parse ? tokenizer.parse(match) : { type: tokenizer.name, raw: match[0], text: match[0] }
    const token = produced || {}
    if (!token.type) {
      token.type = tokenizer.name
    }
    if (!token.raw) {
      token.raw = match[0]
    }
    if (!token.text) {
      token.text = token.raw
    }
    parts.push(token)
    remaining = remaining.slice(idx + match[0].length)
  }

  return parts
}

/**
 * Transform a token stream produced by the baseline lexer by applying
 * registered custom tokenizers to inline/text tokens.
 *
 * This walks the provided `tokens` array and:
 * - Recursively processes any token that contains an inline `tokens` array.
 * - For textual tokens (`text`, `codespan`, `html`) it runs
 *   `processTextWithTokenizers` to split the token into smaller parts.
 * - Leaves other tokens untouched.
 *
 * The output is a flattened array suitable to be consumed by the
 * `parseMarkdown` walkers that map token objects to ProseMirror nodes.
 *
 * @param tokens - Token array returned from the baseline lexer (e.g. marked).
 * @param tokenizers - Array of `CustomTokenizer` definitions.
 * @returns Transformed token array with custom tokens injected.
 */
function transformTokens(tokens: any[], tokenizers: CustomTokenizer[]) {
  const out: any[] = []

  tokens.forEach(token => {
    // If token has inline tokens, transform them recursively
    if (token.tokens && Array.isArray(token.tokens)) {
      token.tokens = transformTokens(token.tokens, tokenizers)
      out.push(token)
      return
    }

    if (token.type === 'text' || token.type === 'codespan' || token.type === 'html') {
      const text = token.text ?? token.raw ?? ''
      const parts = processTextWithTokenizers(String(text), tokenizers)
      parts.forEach(p => out.push(p))
      return
    }

    out.push(token)
  })

  return out
}

/**
 * Build a tokenizer instance that composes the baseline lexer with
 * extension-derived tokenizers.
 *
 * Behavior summary:
 * - If `setMarkdownParser` was previously used to inject a custom parser,
 *   this function delegates to that implementation.
 * - Otherwise it lazily imports the baseline tokenizer (`marked`) and
 *   constructs a small wrapper that post-processes tokens using
 *   `CustomTokenizer` instances derived from extensions and `options.customTokenizers`.
 *
 * Returned object shape:
 * {
 *   extensions, options,
 *   tokenize(markdown: string) => { tokens: Array }
 * }
 *
 * @param extensions - Array of Tiptap extensions registered with the editor. If
 *                     an extension exposes a `markdown` hint (e.g. { match: /.../, parse })
 *                     it will be turned into a `CustomTokenizer`.
 * @param options - Optional configuration, supports `customTokenizers`.
 * @returns An object with a `tokenize(markdown)` method producing transformed tokens.
 */
export async function buildTokenizerForExtensions(extensions: any[] = [], options: any = {}) {
  // If a custom parser was injected, use it directly.
  if (customParser) {
    return customParser.build(extensions, options)
  }

  // Lazy-load `marked` to keep initial bundle light.
  const marked: any = await import('marked')

  // Build custom tokenizers derived from extensions' markdown hints.
  const tokenizers: CustomTokenizer[] = []
  const exts = extensions || []
  exts.forEach(ext => {
    // Prefer markdown in the extension's `config` (Extension instances carry their
    // configuration on `config`). Fall back to a top-level `markdown` field if present.
    const md = (ext && (ext.config?.markdown ?? ext.markdown)) as any
    // Prefer md.name when present so the extension can explicitly control
    // the tokenizer identity independent from the extension `name`.
    const name = (md && md.name) || (ext && ext.config?.name) || (ext && ext.name) || 'custom'
    if (md && md.match instanceof RegExp) {
      tokenizers.push({
        name,
        match: md.match,
        parse: md.parse,
      })
    }
  })

  // Merge any custom tokenizers passed via options
  if (Array.isArray(options.customTokenizers)) {
    options.customTokenizers.forEach((ct: any) => tokenizers.push(ct))
  }

  return {
    extensions,
    options,
    tokenize(markdown: string) {
      const tokens = marked.lexer(String(markdown))
      const transformed = transformTokens(tokens, tokenizers)
      return { tokens: transformed }
    },
  }
}

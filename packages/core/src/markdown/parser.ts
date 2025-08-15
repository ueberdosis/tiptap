import type { Extension } from '../Extension.js'
import { buildTokenizerForExtensions } from './tokenizer.js'
import type { MarkdownParseResult } from './types.js'

/**
 * Parse a Markdown string into a ProseMirror-style JSON document.
 *
 * This function uses `buildTokenizerForExtensions` to obtain a tokenizer
 * (which may be the built-in `marked`-based tokenizer or a custom one
 * injected via `setMarkdownParser`). It then walks the token stream and
 * maps tokens to a minimal ProseMirror JSON shape. The mapping covers
 * common block and inline token types; unknown tokens fall back to plain
 * text or paragraph nodes.
 *
 * Note: this parser is intentionally minimal and JSON-shaped (not tied to
 * the Editor instance). Extensions can later provide `parseMarkdown` helpers
 * to customize node/mark mapping; this base implementation provides
 * sensible defaults for paragraphs, headings, lists, links, images, code, etc.
 *
 * @param markdown - Markdown source string.
 * @param extensions - Optional array of Tiptap extensions; used to build tokenizer rules.
 * @param options - Optional tokenizer options.
 * @returns A Promise resolving to a ProseMirror-style `doc` JSON.
 */
export async function markdownParser(markdown: string, extensions: Extension[] = [], options: any = {}) {
  const tokenizer = await buildTokenizerForExtensions(extensions, options)
  const out = tokenizer.tokenize(String(markdown))
  const tokens = out && out.tokens ? out.tokens : []

  // Build a registry of extension-provided parseMarkdown handlers.
  // Keys use the extension `name` or `markdown.name` to match token.type emitted by the tokenizer.
  type ParserFn = (token: any) => MarkdownParseResult | Promise<MarkdownParseResult>
  const extensionParsers = new Map<string, ParserFn>()

  extensions.forEach(ext => {
    // Prefer markdown.name from the configured `config` (Extension instances store
    // their runtime config on `config`). Fall back to top-level `markdown` or
    // the instance `name`.
    const md = ext?.config?.markdown
    const name = md?.name ?? ext?.name
    if (!name) {
      return
    }
    if (typeof ext.config.parseMarkdown === 'function') {
      // Legacy instance method: parseMarkdown(token)
      extensionParsers.set(name, ext.config.parseMarkdown.bind(ext) as ParserFn)
    } else if (ext?.config?.markdown && typeof ext.config.markdown.parse === 'function') {
      // Config-based handler: config.markdown.parse(token)
      extensionParsers.set(name, ext.config.markdown.parse.bind(ext) as ParserFn)
    }
  })

  // Helper to apply a mark descriptor to all text nodes inside a node tree.
  function applyMarkToNodes(nodes: any[], markObj: any) {
    nodes.forEach(n => {
      if (!n) {
        return
      }
      if (n.type === 'text') {
        n.marks = n.marks || []
        n.marks.push(markObj)
      } else if (n.content && Array.isArray(n.content)) {
        applyMarkToNodes(n.content, markObj)
      }
    })
  }

  async function tokenToNode(token: any): Promise<any | null> {
    // If an extension or default parser has registered a handler for this
    // token type, call it and use its result. `extensionParsers` is populated
    // earlier with extension-provided handlers and default parsers.
    if (token && token.type && extensionParsers.has(token.type)) {
      try {
        const handler = extensionParsers.get(token.type) as ParserFn
        const res = await handler(token)
        if (res) {
          // array of nodes
          if (Array.isArray(res)) {
            return res
          }

          // wrapper { mark, content }
          if (res && typeof res === 'object' && 'mark' in res && Array.isArray((res as any).content)) {
            const content = (res as any).content as any[]
            applyMarkToNodes(content, (res as any).mark)
            return content
          }

          // single node
          return res
        }
      } catch {
        // if extension parser throws, fall back to ignoring the token
      }
    }

    // No fallback: if no handler exists for this token type, return null.
    return null
  }

  // Allow extension parsers to return a single node or an array of nodes.
  const resolved = await Promise.all(tokens.map((token: any) => tokenToNode(token)))
  const content = resolved.flatMap((res: any) => {
    if (Array.isArray(res)) {
      return res.filter(Boolean)
    }
    return res ? [res] : []
  })

  return { type: 'doc', content }
}

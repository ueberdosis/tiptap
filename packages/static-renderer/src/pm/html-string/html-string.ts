/* oslint-disableno-explicit-any */
import type { DOMOutputSpecArray, Extensions, JSONContent } from '@tiptap/core'
import type { DOMOutputSpec, Mark, Node } from '@tiptap/pm/model'

import {
  escapeHTML,
  renderJSONContentToString,
  serializeAttrsToHTMLString,
  serializeChildrenToHTMLString,
} from '../../json/html-string/string.js'
import type { TiptapStaticRendererOptions } from '../../json/renderer.js'
import type { StaticEditorOptions } from '../extensionRenderer.js'
import { applyStaticEditorOptionsToExtensions, renderToElement } from '../extensionRenderer.js'

export {
  serializeAttrsToHTMLString,
  serializeChildrenToHTMLString,
} from '../../json/html-string/string.js'

/**
 * HTML elements that cannot be self-closing and must always have a closing tag.
 * These elements must be rendered as <tag></tag> even when empty, not <tag />.
 */
const NON_SELF_CLOSING_TAGS = new Set([
  'iframe',
  'script',
  'style',
  'title',
  'textarea',
  'div',
  'span',
  'a',
  'button',
  'audio',
  'video',
])

function renderEmptyTag(tag: string, attrs?: Record<string, unknown>): () => string {
  const attributes = serializeAttrsToHTMLString(attrs)

  if (NON_SELF_CLOSING_TAGS.has(tag)) {
    return () => `<${tag}${attributes}></${tag}>`
  }

  return () => `<${tag}${attributes}/>`
}

function renderNestedSpec(
  tag: string,
  content: DOMOutputSpecArray,
): (child?: string | string[]) => string {
  const [, attrs, children, ...rest] = content
  const renderAttributes = domOutputSpecToHTMLString(attrs as DOMOutputSpecArray)

  if (children === undefined || children === 0) {
    return child => `<${tag}>${renderAttributes(child)}</${tag}>`
  }

  return child =>
    `<${tag}>${renderAttributes(child)}${[children]
      .concat(rest)
      .map(spec => domOutputSpecToHTMLString(spec)(child))}</${tag}>`
}

function renderAttributedTag(
  tag: string,
  content: DOMOutputSpecArray,
): (child?: string | string[]) => string {
  const [, rawAttrs, children, ...rest] = content
  const attrs = rawAttrs as Record<string, unknown>

  if (children === undefined) {
    return renderEmptyTag(tag, attrs)
  }
  if (children === 0) {
    return child =>
      `<${tag}${serializeAttrsToHTMLString(attrs)}>${serializeChildrenToHTMLString(child)}</${tag}>`
  }

  return child =>
    `<${tag}${serializeAttrsToHTMLString(attrs)}>${[children]
      .concat(rest)
      .map(spec => domOutputSpecToHTMLString(spec)(child))
      .join('')}</${tag}>`
}

function normalizeTag(tag: string): string {
  const parts = tag.split(' ')

  if (parts.length > 1) {
    return `${parts[1]} xmlns="${parts[0]}"`
  }

  return tag
}

/**
 * Take a DOMOutputSpec and return a function that can render it to a string
 * @param content The DOMOutputSpec to convert to a string
 * @returns A function that can render the DOMOutputSpec to a string
 */
export function domOutputSpecToHTMLString(
  content: DOMOutputSpec,
): (children?: string | string[]) => string {
  if (typeof content === 'string') {
    return () => escapeHTML(content)
  }
  if (typeof content === 'object' && 'length' in content) {
    const [_tag, attrs] = content as DOMOutputSpecArray
    const tag = normalizeTag(_tag)

    if (attrs === undefined) {
      return renderEmptyTag(tag)
    }
    if (attrs === 0) {
      return child => `<${tag}>${serializeChildrenToHTMLString(child)}</${tag}>`
    }
    if (typeof attrs === 'object') {
      if (Array.isArray(attrs)) {
        return renderNestedSpec(tag, content as DOMOutputSpecArray)
      }
      return renderAttributedTag(tag, content as DOMOutputSpecArray)
    }
  }

  // TODO support DOM elements? How to handle them?
  throw new Error(
    '[tiptap error]: Unsupported DomOutputSpec type, check the `renderHTML` method output or implement a node mapping',
    {
      cause: content,
    },
  )
}

/**
 * This function will statically render a Prosemirror Node to HTML using the provided extensions and options.
 *
 * Limitations: this function builds the schema and runs each extension's
 * `renderHTML`, but does not instantiate an `Editor`. Extensions that mutate
 * the document inside `addProseMirrorPlugins`, `onCreate`, or transaction
 * hooks will not run. For UniqueID, pre-process the JSON with
 * `generateUniqueIds` from `@tiptap/extension-unique-id`; for TableOfContents,
 * pre-process with `generateTocIds` from `@tiptap/extension-table-of-contents`.
 *
 * @param content The content to render to HTML
 * @param extensions The extensions to use for rendering
 * @param staticEditorOptions Optional editor-level options that affect rendered output, currently `{ textDirection }`. Mirrors a subset of `EditorOptions`.
 * @param options The options to use for rendering
 * @returns The rendered HTML string
 */
export function renderToHTMLString({
  content,
  extensions,
  staticEditorOptions,
  options,
}: {
  content: Node | JSONContent
  extensions: Extensions
  staticEditorOptions?: StaticEditorOptions
  options?: Partial<TiptapStaticRendererOptions<string, Mark, Node>>
}): string {
  return renderToElement<string>({
    renderer: renderJSONContentToString,
    domOutputSpecToElement: domOutputSpecToHTMLString,
    mapDefinedTypes: {
      // Map a doc node to concatenated children
      doc: ({ children }) => serializeChildrenToHTMLString(children),
      // Map a text node to its text content
      text: ({ node }) => escapeHTML(node.text ?? ''),
    },
    content,
    extensions: applyStaticEditorOptionsToExtensions(extensions, staticEditorOptions),
    options,
  })
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DOMOutputSpecArray, Extensions, JSONContent } from '@dibdab/core'
import type { DOMOutputSpec, Mark, Node } from '@dibdab/pm/model'

import {
  renderJSONContentToString,
  serializeAttrsToHTMLString,
  serializeChildrenToHTMLString,
} from '../../json/html-string/string.js'
import type { TiptapStaticRendererOptions } from '../../json/renderer.js'
import { renderToElement } from '../extensionRenderer.js'

export { serializeAttrsToHTMLString, serializeChildrenToHTMLString } from '../../json/html-string/string.js'

/**
 * HTML elements that cannot be self-closing and must always have a closing tag.
 * These elements must be rendered as <tag></tag> even when empty, not <tag />.
 */
const NON_SELF_CLOSING_TAGS = new Set(['iframe', 'script', 'style', 'title', 'textarea', 'div', 'span', 'a', 'button'])

/**
 * Take a DOMOutputSpec and return a function that can render it to a string
 * @param content The DOMOutputSpec to convert to a string
 * @returns A function that can render the DOMOutputSpec to a string
 */
export function domOutputSpecToHTMLString(content: DOMOutputSpec): (children?: string | string[]) => string {
  if (typeof content === 'string') {
    return () => content
  }
  if (typeof content === 'object' && 'length' in content) {
    const [_tag, attrs, children, ...rest] = content as DOMOutputSpecArray
    let tag = _tag
    const parts = tag.split(' ')

    if (parts.length > 1) {
      tag = `${parts[1]} xmlns="${parts[0]}"`
    }

    if (attrs === undefined) {
      return () => `<${tag}/>`
    }
    if (attrs === 0) {
      return child => `<${tag}>${serializeChildrenToHTMLString(child)}</${tag}>`
    }
    if (typeof attrs === 'object') {
      if (Array.isArray(attrs)) {
        if (children === undefined) {
          return child => `<${tag}>${domOutputSpecToHTMLString(attrs as DOMOutputSpecArray)(child)}</${tag}>`
        }
        if (children === 0) {
          return child => `<${tag}>${domOutputSpecToHTMLString(attrs as DOMOutputSpecArray)(child)}</${tag}>`
        }
        return child =>
          `<${tag}>${domOutputSpecToHTMLString(attrs as DOMOutputSpecArray)(child)}${[children]
            .concat(rest)
            .map(a => domOutputSpecToHTMLString(a)(child))}</${tag}>`
      }
      if (children === undefined) {
        if (NON_SELF_CLOSING_TAGS.has(tag)) {
          return () => `<${tag}${serializeAttrsToHTMLString(attrs)}></${tag}>`
        }
        return () => `<${tag}${serializeAttrsToHTMLString(attrs)}/>`
      }
      if (children === 0) {
        return child => `<${tag}${serializeAttrsToHTMLString(attrs)}>${serializeChildrenToHTMLString(child)}</${tag}>`
      }

      return child =>
        `<${tag}${serializeAttrsToHTMLString(attrs)}>${[children]
          .concat(rest)
          .map(a => domOutputSpecToHTMLString(a)(child))
          .join('')}</${tag}>`
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
 * This function will statically render a Prosemirror Node to HTML using the provided extensions and options
 * @param content The content to render to HTML
 * @param extensions The extensions to use for rendering
 * @param options The options to use for rendering
 * @returns The rendered HTML string
 */
export function renderToHTMLString({
  content,
  extensions,
  options,
}: {
  content: Node | JSONContent
  extensions: Extensions
  options?: Partial<TiptapStaticRendererOptions<string, Mark, Node>>
}): string {
  return renderToElement<string>({
    renderer: renderJSONContentToString,
    domOutputSpecToElement: domOutputSpecToHTMLString,
    mapDefinedTypes: {
      // Map a doc node to concatenated children
      doc: ({ children }) => serializeChildrenToHTMLString(children),
      // Map a text node to its text content
      text: ({ node }) => node.text ?? '',
    },
    content,
    extensions,
    options,
  })
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Extensions, JSONContent } from '@tiptap/core'
import type { DOMOutputSpec, Mark, Node } from '@tiptap/pm/model'

import { TiptapStaticRendererOptions } from '../json/renderer.js'
import { renderJSONContentToString } from '../json/string.js'
import type { DOMOutputSpecArray } from '../types.js'
import { renderToElement } from './extensionRenderer.js'

/**
 * Serialize the attributes of a node or mark to a string
 * @param attrs The attributes to serialize
 * @returns The serialized attributes as a string
 */
export function serializeAttrsToHTMLString(attrs: Record<string, any>): string {
  const output = Object.entries(attrs)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(' ')

  return output ? ` ${output}` : ''
}

/**
 * Serialize the children of a node or mark to a string
 * @param children The children to serialize
 * @returns The serialized children as a string
 */
export function serializeChildrenToHTMLString(children?: string | string[]): string {
  return ([] as string[])
    .concat(children || '')
    .filter(Boolean)
    .join('')
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
    return () => content
  }
  if (typeof content === 'object' && 'length' in content) {
    const [tag, attrs, children, ...rest] = content as DOMOutputSpecArray

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
        return child => `<${tag}>${domOutputSpecToHTMLString(attrs as DOMOutputSpecArray)(child)}${[children]
          .concat(rest)
          .map(a => domOutputSpecToHTMLString(a)(child))}</${tag}>`
      }
      if (children === undefined) {
        return () => `<${tag}${serializeAttrsToHTMLString(attrs)}/>`
      }
      if (children === 0) {
        return child => `<${tag}${serializeAttrsToHTMLString(attrs)}>${serializeChildrenToHTMLString(
          child,
        )}</${tag}>`
      }

      return child => `<${tag}${serializeAttrsToHTMLString(attrs)}>${[children]
        .concat(rest)
        .map(a => domOutputSpecToHTMLString(a)(child))
        .join('')}</${tag}>`
    }
  }

  // TODO support DOM elements? How to handle them?
  throw new Error(
    '[tiptap error]: Unsupported DomOutputSpec type, check the `renderHTML` method output',
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
  content: Node | JSONContent;
  extensions: Extensions;
  options?: Partial<TiptapStaticRendererOptions<string, Mark, Node>>;
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

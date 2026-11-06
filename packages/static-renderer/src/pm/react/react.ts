/* oslint-disable no-plusplus,no-explicit-any */
import type { DOMOutputSpecArray, Extensions, JSONContent } from '@tiptap/core'
import type { DOMOutputSpec, Mark, Node as PMNode } from '@tiptap/pm/model'
import React from 'react'

import { renderJSONContentToReactElement } from '../../json/react/react.js'
import type { TiptapStaticRendererOptions } from '../../json/renderer.js'
import type { StaticEditorOptions } from '../extensionRenderer.js'
import { applyStaticEditorOptionsToExtensions, renderToElement } from '../extensionRenderer.js'

const HTML_ATTRIBUTE_TO_REACT_ATTRIBUTE: Record<string, string> = {
  colspan: 'colSpan',
  rowspan: 'rowSpan',
}

const STYLE_NAME_SEPARATOR = /-([a-z])/g
// CSS identifiers can include non-ASCII characters.
const STYLE_URL_FUNCTION = /^(?:[^a-z0-9_\u0080-\uFFFF-])?url$/i
const STYLE_WHITESPACE = /\s/

// Preserve colons in values when splitting a CSS declaration.
function addStyleDeclaration(style: Record<string, string>, declaration: string): void {
  const separator = declaration.indexOf(':')

  if (separator === -1) {
    return
  }

  const property = declaration.slice(0, separator).trim()
  const value = declaration.slice(separator + 1).trim()

  if (!property || !value) {
    return
  }

  // CSS custom property names are case-sensitive.
  const reactProperty = property.startsWith('--')
    ? property
    : property.replace(STYLE_NAME_SEPARATOR, (_, letter: string) => letter.toUpperCase())

  style[reactProperty] = value
}

// Return the closing quote index, or source.length if the string is unfinished.
function skipStyleString(source: string, start: number): number {
  for (let index = start + 1; index < source.length; index += 1) {
    // Escaped quotes cannot close the string.
    if (source[index] === '\\') {
      index += 1
      continue
    }

    if (source[index] === source[start]) {
      return index
    }
  }

  return source.length
}

// start points to the opening parenthesis, not the URL's first character.
function skipStyleUrl(source: string, start: number): number {
  let index = start + 1

  while (index < source.length && STYLE_WHITESPACE.test(source[index])) {
    index += 1
  }

  // Let the string scanner handle quoted URLs.
  if (source[index] === '"' || source[index] === "'") {
    return start
  }

  while (index < source.length && source[index] !== ')') {
    index += source[index] === '\\' ? 2 : 1
  }

  return index
}

// Return a skip endpoint; the original index means no skip.
function skipStyleToken(source: string, index: number): number {
  const character = source[index]

  if (character === '\\') {
    return index + 1
  }

  if (character === '"' || character === "'") {
    return skipStyleString(source, index)
  }

  if (character === '(' && STYLE_URL_FUNCTION.test(source.slice(Math.max(0, index - 4), index))) {
    // Unquoted URLs can contain comment markers.
    return skipStyleUrl(source, index)
  }

  return index
}

function parseReactStyle(source: string): Record<string, string> {
  const style: Record<string, string> = {}
  let depth = 0
  let start = 0
  // Preserve fragments before comments until the declaration ends.
  let declaration = ''

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    const tokenEnd = skipStyleToken(source, index)

    if (tokenEnd !== index) {
      // The loop advances past the returned endpoint.
      index = tokenEnd
      continue
    }

    if (source.startsWith('/*', index)) {
      // Keep adjacent tokens separate when removing comments.
      declaration += source.slice(start, index) + ' '

      const commentEnd = source.indexOf('*/', index + 2)
      index = commentEnd === -1 ? source.length : commentEnd + 1
      start = index + 1
      continue
    }

    if ('([{'.includes(character)) {
      depth += 1
      continue
    }

    if (')]}'.includes(character)) {
      depth = Math.max(0, depth - 1)
      continue
    }

    // Only top-level semicolons end a declaration.
    if (character === ';' && depth === 0) {
      addStyleDeclaration(style, declaration + source.slice(start, index))
      declaration = ''
      start = index + 1
    }
  }

  // A final declaration does not need a trailing semicolon.
  addStyleDeclaration(style, declaration + source.slice(start))

  return style
}

/**
 * This function maps the attributes of a node or mark to HTML attributes
 * @param attrs The attributes to map
 * @param key The key to use for the React element
 * @returns The mapped HTML attributes as an object
 */
export function mapAttrsToHTMLAttributes(
  attrs?: Record<string, any>,
  key?: string,
): Record<string, any> {
  if (!attrs) {
    return { key }
  }
  return Object.entries(attrs).reduce(
    (acc, [name, value]) => {
      if (name === 'class') {
        return Object.assign(acc, { className: value })
      }

      if (name === 'style' && typeof value === 'string') {
        return Object.assign(acc, { style: parseReactStyle(value) })
      }

      const reactName = HTML_ATTRIBUTE_TO_REACT_ATTRIBUTE[name] ?? name

      return Object.assign(acc, { [reactName]: value })
    },
    { key },
  )
}

/**
 * Take a DOMOutputSpec and return a function that can render it to a React element
 * @param content The DOMOutputSpec to convert to a React element
 * @returns A function that can render the DOMOutputSpec to a React element
 */
export function domOutputSpecToReactElement(
  content: DOMOutputSpec,
  key = 0,
): (children?: React.ReactNode) => React.ReactNode {
  if (typeof content === 'string') {
    return () => content
  }
  if (typeof content === 'object' && 'length' in content) {
    // oxlint-disable-next-line prefer-const
    let [tag, attrs, children, ...rest] = content as DOMOutputSpecArray
    const parts = tag.split(' ')

    if (parts.length > 1) {
      tag = parts[1]
      if (attrs === undefined) {
        attrs = {
          xmlns: parts[0],
        }
      }
      if (attrs === 0) {
        attrs = {
          xmlns: parts[0],
        }
        children = 0
      }
      if (typeof attrs === 'object') {
        attrs = Object.assign(attrs, { xmlns: parts[0] })
      }
    }

    if (attrs === undefined) {
      return () => React.createElement(tag, mapAttrsToHTMLAttributes(undefined, key.toString()))
    }
    if (attrs === 0) {
      return child =>
        React.createElement(tag, mapAttrsToHTMLAttributes(undefined, key.toString()), child)
    }
    if (typeof attrs === 'object') {
      if (Array.isArray(attrs)) {
        if (children === undefined) {
          return child =>
            React.createElement(
              tag,
              mapAttrsToHTMLAttributes(undefined, key.toString()),
              domOutputSpecToReactElement(attrs as DOMOutputSpecArray, key++)(child),
            )
        }
        if (children === 0) {
          return child =>
            React.createElement(
              tag,
              mapAttrsToHTMLAttributes(undefined, key.toString()),
              domOutputSpecToReactElement(attrs as DOMOutputSpecArray, key++)(child),
            )
        }
        return child =>
          React.createElement(
            tag,
            mapAttrsToHTMLAttributes(undefined, key.toString()),
            domOutputSpecToReactElement(attrs as DOMOutputSpecArray)(child),
            [children, ...rest].map(outputSpec =>
              domOutputSpecToReactElement(outputSpec, key++)(child),
            ),
          )
      }
      if (children === undefined) {
        return () => React.createElement(tag, mapAttrsToHTMLAttributes(attrs, key.toString()))
      }
      if (children === 0) {
        return child =>
          React.createElement(tag, mapAttrsToHTMLAttributes(attrs, key.toString()), child)
      }

      return child =>
        React.createElement(
          tag,
          mapAttrsToHTMLAttributes(attrs, key.toString()),
          [children, ...rest].map(outputSpec =>
            domOutputSpecToReactElement(outputSpec, key++)(child),
          ),
        )
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
 * This function will statically render a Prosemirror Node to a React component using the given extensions.
 *
 * Limitations: see `renderToHTMLString` — extensions that mutate the document
 * via plugins/onCreate (UniqueID, TableOfContents) need to be pre-processed.
 *
 * @param content The content to render to a React component
 * @param extensions The extensions to use for rendering
 * @param staticEditorOptions Optional editor-level options that affect rendered output — mirrors a subset of `EditorOptions`.
 * @param options The options to use for rendering
 * @returns The React element that represents the rendered content
 */
export function renderToReactElement({
  content,
  extensions,
  staticEditorOptions,
  options,
}: {
  content: PMNode | JSONContent
  extensions: Extensions
  staticEditorOptions?: StaticEditorOptions
  options?: Partial<TiptapStaticRendererOptions<React.ReactNode, Mark, PMNode>>
}): React.ReactNode {
  return renderToElement<React.ReactNode>({
    renderer: renderJSONContentToReactElement,
    domOutputSpecToElement: domOutputSpecToReactElement,
    mapDefinedTypes: {
      // Map a doc node to concatenated children
      doc: ({ children }) => React.createElement(React.Fragment, {}, children),
      // Map a text node to its text content
      text: ({ node }) => node.text ?? '',
    },
    content,
    extensions: applyStaticEditorOptionsToExtensions(extensions, staticEditorOptions),
    options,
  })
}

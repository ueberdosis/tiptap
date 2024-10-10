/* eslint-disable no-plusplus, @typescript-eslint/no-explicit-any */
import { Extensions, JSONContent } from '@tiptap/core'
import type { DOMOutputSpec, Mark, Node } from '@tiptap/pm/model'
import React from 'react'

import { renderJSONContentToReactElement } from '../json/react.js'
import { TiptapStaticRendererOptions } from '../json/renderer.js'
import type { DOMOutputSpecArray } from '../types.js'
import { renderToElement } from './extensionRenderer.js'

/**
 * This function maps the attributes of a node or mark to HTML attributes
 * @param attrs The attributes to map
 * @param key The key to use for the React element
 * @returns The mapped HTML attributes as an object
 */
function mapAttrsToHTMLAttributes(attrs?: Record<string, any>, key?: string): Record<string, any> {
  if (!attrs) {
    return { key }
  }
  return Object.entries(attrs).reduce(
    (acc, [name, value]) => {
      if (name === 'class') {
        return Object.assign(acc, { className: value })
      }
      return Object.assign(acc, { [name]: value })
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
    const [tag, attrs, children, ...rest] = content as DOMOutputSpecArray

    if (attrs === undefined) {
      return () => React.createElement(tag, mapAttrsToHTMLAttributes(undefined, key.toString()))
    }
    if (attrs === 0) {
      return child => React.createElement(tag, mapAttrsToHTMLAttributes(undefined, key.toString()), child)
    }
    if (typeof attrs === 'object') {
      if (Array.isArray(attrs)) {
        if (children === undefined) {
          return child => React.createElement(
            tag,
            mapAttrsToHTMLAttributes(undefined, key.toString()),
            domOutputSpecToReactElement(attrs as DOMOutputSpecArray, key++)(child),
          )
        }
        if (children === 0) {
          return child => React.createElement(
            tag,
            mapAttrsToHTMLAttributes(undefined, key.toString()),
            domOutputSpecToReactElement(attrs as DOMOutputSpecArray, key++)(child),
          )
        }
        return child => React.createElement(
          tag,
          mapAttrsToHTMLAttributes(undefined, key.toString()),
          domOutputSpecToReactElement(attrs as DOMOutputSpecArray)(child),
          [children]
            .concat(rest)
            .map(outputSpec => domOutputSpecToReactElement(outputSpec, key++)(child)),
        )
      }
      if (children === undefined) {
        return () => React.createElement(tag, mapAttrsToHTMLAttributes(attrs, key.toString()))
      }
      if (children === 0) {
        return child => React.createElement(tag, mapAttrsToHTMLAttributes(attrs, key.toString()), child)
      }

      return child => React.createElement(
        tag,
        mapAttrsToHTMLAttributes(attrs, key.toString()),
        [children]
          .concat(rest)
          .map(outputSpec => domOutputSpecToReactElement(outputSpec, key++)(child)),
      )
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
 * This function will statically render a Prosemirror Node to a React component using the given extensions
 * @param content The content to render to a React component
 * @param extensions The extensions to use for rendering
 * @param options The options to use for rendering
 * @returns The React element that represents the rendered content
 */
export function renderToReactElement({
  content,
  extensions,
  options,
}: {
  content: Node | JSONContent;
  extensions: Extensions;
  options?: Partial<TiptapStaticRendererOptions<React.ReactNode, Mark, Node>>;
}): React.ReactNode {
  return renderToElement<React.ReactNode>({
    renderer: renderJSONContentToReactElement,
    domOutputSpecToElement: domOutputSpecToReactElement,
    mapDefinedTypes: {
      // Map a doc node to concatenated children
      doc: ({ children }) => <>{children}</>,
      // Map a text node to its text content
      text: ({ node }) => node.text ?? '',
    },
    content,
    extensions,
    options,
  })
}

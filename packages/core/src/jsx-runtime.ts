export type Attributes = Record<string, any>

export type DOMOutputSpecElement = 0 | Attributes | DOMOutputSpecArray
/**
 * Better describes the output of a `renderHTML` function in prosemirror
 * @see https://prosemirror.net/docs/ref/#model.DOMOutputSpec
 */
export type DOMOutputSpecArray =
  | [string]
  | [string, Attributes]
  | [string, 0]
  | [string, Attributes, 0]
  | [string, Attributes, DOMOutputSpecArray | 0]
  | [string, DOMOutputSpecArray]

// JSX types for Tiptap's JSX runtime
// These types only apply when using @jsxImportSource @tiptap/core
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
  export type Element = DOMOutputSpecArray
  export interface IntrinsicElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
  export interface ElementChildrenAttribute {
    children: unknown
  }
}

export type JSXRenderer = (
  tag: 'slot' | string | ((props?: Attributes) => DOMOutputSpecArray | DOMOutputSpecElement),
  props?: Attributes,
  ...children: JSXRenderer[]
) => DOMOutputSpecArray | DOMOutputSpecElement

export function Fragment(props: { children: JSXRenderer[] }) {
  return props.children
}

export const h: JSXRenderer = (tag, attributes) => {
  // Treat the slot tag as the Prosemirror hole to render content into
  if (tag === 'slot') {
    return 0
  }

  // If the tag is a function, call it with the props
  if (tag instanceof Function) {
    return tag(attributes)
  }

  const { children, ...rest } = attributes ?? {}

  if (tag === 'svg') {
    throw new Error('SVG elements are not supported in the JSX syntax, use the array syntax instead')
  }

  // Handle children array by spreading elements
  if (Array.isArray(children)) {
    if (children.length === 0) {
      // Empty array means no children
      return [tag, rest]
    }

    // Check if this is a DOMOutputSpecArray (single child) or an array of children
    // DOMOutputSpecArray always starts with a string tag as the first element,
    // optionally followed by attributes object, 0 (content hole), or another DOMOutputSpecArray
    // Note: We only check if firstElement is a string because per ProseMirror spec,
    // DOMOutputSpec MUST start with a tag name (string). The 0 can only appear
    // as a subsequent element to mark content insertion points.
    const firstElement = children[0]
    const secondElement = children.length > 1 ? children[1] : undefined
    const isDOMOutputSpec =
      typeof firstElement === 'string' &&
      (secondElement === undefined ||
        secondElement === 0 ||
        (typeof secondElement === 'object' && secondElement !== null && !Array.isArray(secondElement)) ||
        (Array.isArray(secondElement) && typeof secondElement[0] === 'string'))

    if (isDOMOutputSpec) {
      // This is a single DOMOutputSpecArray child, not multiple children
      return [tag, rest, children]
    }

    // Filter out null/undefined values from array of children
    const validChildren = children.filter(child => child != null)

    if (validChildren.length === 0) {
      return [tag, rest]
    }

    // Spread children into the result array
    return [tag, rest, ...validChildren]
  }

  // Single child or no children
  if (children !== undefined && children !== null) {
    return [tag, rest, children]
  }

  return [tag, rest]
}

// See
// https://esbuild.github.io/api/#jsx-import-source
// https://www.typescriptlang.org/tsconfig/#jsxImportSource

export { h as createElement, h as jsx, h as jsxDEV, h as jsxs }

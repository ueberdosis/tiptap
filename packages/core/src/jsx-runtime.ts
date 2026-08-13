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
// oxlint-disable-next-lineno-namespace
export namespace JSX {
  export type Element = DOMOutputSpecArray
  export interface IntrinsicElements {
    // oxlint-disable-next-lineno-explicit-any
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

function render(
  tag: Parameters<JSXRenderer>[0],
  attributes: Attributes | undefined,
  hasMultipleChildren: boolean,
) {
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
    throw new Error(
      'SVG elements are not supported in the JSX syntax, use the array syntax instead',
    )
  }

  if (hasMultipleChildren && Array.isArray(children)) {
    return [tag, rest, ...children] as DOMOutputSpecArray
  }

  return [tag, rest, children]
}

export const h: JSXRenderer = (tag, attributes) => render(tag, attributes, false)

export const jsxs: JSXRenderer = (tag, attributes) => render(tag, attributes, true)

export const jsxDEV = (
  tag: Parameters<JSXRenderer>[0],
  attributes?: Attributes,
  _key?: unknown,
  isStaticChildren?: boolean,
) => {
  return render(tag, attributes, Boolean(isStaticChildren))
}

// See
// https://esbuild.github.io/api/#jsx-import-source
// https://www.typescriptlang.org/tsconfig/#jsxImportSource

export { h as createElement, h as jsx }

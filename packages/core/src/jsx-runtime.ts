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

// Child lists and DOM output specs are both arrays, so track JSX boundaries by identity.
const jsxElements = new WeakSet<DOMOutputSpecArray>()
const jsxFragments = new WeakSet<unknown[]>()

/** Create a new JSX element from the given spec */
function createJSXElement(spec: unknown[]): DOMOutputSpecArray {
  const element = spec as DOMOutputSpecArray

  jsxElements.add(element)

  return element
}

/** Check if a spec is a JSX element */
function isJSXElement(value: unknown): value is DOMOutputSpecArray {
  return Array.isArray(value) && jsxElements.has(value as DOMOutputSpecArray)
}

function flattenFragmentChildren(children: unknown[]): unknown[] {
  return children.flatMap(child => {
    if (child == null) {
      return []
    }

    if (Array.isArray(child) && jsxFragments.has(child) && !isJSXElement(child)) {
      return flattenFragmentChildren(child)
    }

    return [child]
  })
}

// JSX types for Tiptap's JSX runtime
// These types only apply when using @jsxImportSource @tiptap/core
export declare namespace JSX {
  export type Element = DOMOutputSpecArray
  export interface IntrinsicElements {
    [key: string]: any
  }
  export interface ElementChildrenAttribute {
    children: unknown
  }
}

type JSXChild = DOMOutputSpecElement | string | null | undefined | JSXChild[]

export type JSXRenderer = (
  tag: 'slot' | string | ((props?: Attributes) => DOMOutputSpecArray | DOMOutputSpecElement),
  props?: Attributes,
  ...children: JSXChild[]
) => DOMOutputSpecArray | DOMOutputSpecElement

export function Fragment(props: { children: JSXChild[] }) {
  jsxFragments.add(props.children)

  return props.children
}

function render(tag: Parameters<JSXRenderer>[0], attributes: Attributes | undefined) {
  // Treat the slot tag as the Prosemirror hole to render content into
  if (tag === 'slot') {
    return 0
  }

  // If the tag is a function, call it with the props
  if (tag instanceof Function) {
    const result = tag(attributes)

    if (Array.isArray(result) && !isJSXElement(result) && !jsxFragments.has(result)) {
      return createJSXElement(result)
    }

    return result
  }

  const { children, ...rest } = attributes ?? {}

  if (tag === 'svg') {
    throw new Error(
      'SVG elements are not supported in the JSX syntax, use the array syntax instead',
    )
  }

  // Handle children array by spreading elements
  if (Array.isArray(children)) {
    if (isJSXElement(children)) {
      return createJSXElement([tag, rest, children])
    }

    if (children.length === 0) {
      // Empty array means no children
      return createJSXElement([tag, rest])
    }

    const flattenedChildren = flattenFragmentChildren(children)

    if (flattenedChildren.length === 0) {
      return createJSXElement([tag, rest])
    }

    // Spread children into the result array
    return createJSXElement([tag, rest, ...flattenedChildren])
  }

  // Single child or no children
  if (children !== undefined && children !== null) {
    return createJSXElement([tag, rest, children])
  }

  return createJSXElement([tag, rest])
}

export const h: JSXRenderer = (tag, attributes) => render(tag, attributes)

export const jsxs: JSXRenderer = (tag, attributes) => render(tag, attributes)

export const jsxDEV = (
  tag: Parameters<JSXRenderer>[0],
  attributes?: Attributes,
  _key?: unknown,
  _isStaticChildren?: boolean,
) => {
  return render(tag, attributes)
}

// See
// https://esbuild.github.io/api/#jsx-import-source
// https://www.typescriptlang.org/tsconfig/#jsxImportSource

export { h as createElement, h as jsx }

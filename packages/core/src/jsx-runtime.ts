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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // @ts-ignore - conflict with React typings
    type Element = [string, ...any[]]
    // @ts-ignore - conflict with React typings
    interface IntrinsicElements {
      // @ts-ignore - conflict with React typings
      [key: string]: any
    }
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

  // Otherwise, return the tag, attributes, and children
  return [tag, rest, children]
}

// See
// https://esbuild.github.io/api/#jsx-import-source
// https://www.typescriptlang.org/tsconfig/#jsxImportSource

export { h as createElement, h as jsx, h as jsxDEV, h as jsxs }

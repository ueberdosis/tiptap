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

/**
 * The JSX pragma function for tiptap
 * It will render JSX to a format that Tiptap's `renderHTML` function can understand
 * @example A simple div element
 * ```tsx
 * renderHTML({ HTMLAttributes }) {
 *  return <div {...HTMLAttributes}></div>;
 * }
 * ```
 * @example A div element that wraps it's children
 * ```tsx
 * renderHTML({ HTMLAttributes }) {
 * return <div {...HTMLAttributes}><slot /></div>;
 * }
 * ```
 */
export const jsxTiptap: JSXRenderer = (tag, attributes, ...children) => {
  // Treat the slot tag as the Prosemirror hole to render content into
  if (tag === 'slot') {
    return 0
  }

  // If the tag is a function, call it with the props
  if (tag instanceof Function) {
    return tag(attributes)
  }

  // Otherwise, return the tag, attributes, and children
  return [tag, attributes ?? {}, ...children]
}

export const children = 0

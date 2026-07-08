/** @jsxImportSource react */
import type { MarkViewProps, MarkViewRenderer, MarkViewRendererOptions } from '@tiptap/core'
import type { ComponentProps, ComponentType, ElementType, JSX, ReactNode } from 'react'
import { createContext, useContext } from 'react'

import type {
  MarkViewComponent,
  MarkViewComponentProps,
} from './components/MarkViewComponentProps.js'
import { attributesToProps } from './props.js'
import { assignRef } from './refs.js'

export interface MarkViewContextProps {
  markViewContentRef: (element: HTMLElement | null) => void
  /** The inline content the mark spans, rendered by this renderer. */
  markViewContentChildren?: ReactNode
}

export const ReactMarkViewContext = createContext<MarkViewContextProps>({
  markViewContentRef: () => {
    // no-op
  },
  markViewContentChildren: undefined,
})

export type MarkViewContentProps<T extends keyof JSX.IntrinsicElements = 'span'> = {
  as?: T
} & Omit<ComponentProps<T>, 'as'>

/**
 * The mark's content element, with the `@tiptap/react` API. Under this
 * renderer it receives the mark's inline content as React children and its
 * element becomes the mark view's `contentDOM`.
 */
export const MarkViewContent = <T extends keyof JSX.IntrinsicElements = 'span'>(
  props: MarkViewContentProps<T>,
) => {
  const { as: Tag = 'span', ...rest } = props
  const { markViewContentRef, markViewContentChildren } = useContext(ReactMarkViewContext)

  return (
    // @ts-ignore
    <Tag {...rest} ref={markViewContentRef} data-mark-view-content="">
      {markViewContentChildren}
    </Tag>
  )
}

export interface ReactMarkViewRendererOptions extends MarkViewRendererOptions {
  /**
   * The tag name of the element wrapping the React component.
   */
  as?: string
  className?: string
  attrs?: { [key: string]: string }
}

/**
 * Hosts a `@tiptap/react`-contract mark view component (props like
 * `mark`/`updateAttributes`, content via `MarkViewContent`) under this
 * renderer. Mark components never expose their root element, so the host
 * renders one (`options.as`, default span, class `mark-<name>`) that
 * becomes the mark's DOM — matching the legacy element — while
 * `MarkViewContent` receives the rendered inline content.
 */
export const reactMarkViewComponent = (
  Component: ComponentType<MarkViewProps>,
  options: Partial<ReactMarkViewRendererOptions> = {},
): MarkViewComponent => {
  const MarkViewHost = (props: MarkViewComponentProps): ReactNode => {
    const { editor, mark, HTMLAttributes, updateAttributes, ref, contentDOMRef, children } = props

    const contextValue: MarkViewContextProps = {
      markViewContentRef: element => {
        assignRef(contentDOMRef, element)
      },
      markViewContentChildren: children,
    }

    const componentProps: MarkViewProps = {
      editor,
      mark: mark as MarkViewProps['mark'],
      view: editor.view,
      // Marks span inline content by definition in this renderer
      inline: true,
      HTMLAttributes: HTMLAttributes as MarkViewProps['HTMLAttributes'],
      extension: editor.extensionManager.extensions.find(
        item => item.name === mark.type.name,
      ) as MarkViewProps['extension'],
      updateAttributes,
    }

    const As = (options.as ?? 'span') as ElementType
    const className = [`mark-${mark.type.name}`, options.className].filter(Boolean).join(' ')

    return (
      <As {...attributesToProps(options.attrs)} ref={ref} className={className}>
        <ReactMarkViewContext.Provider value={contextValue}>
          <Component {...componentProps} />
        </ReactMarkViewContext.Provider>
      </As>
    )
  }

  MarkViewHost.displayName = `ReactMarkView(${Component.displayName ?? Component.name ?? 'MarkView'})`
  return MarkViewHost
}

/**
 * Marks constructors produced by `ReactMarkViewRenderer`. `Symbol.for`
 * survives duplicate module instances.
 */
const REACT_MARK_VIEW_MARKER = Symbol.for('@tiptap/react-experimental/mark-view')

export interface ReactMarkViewMarker {
  component: ComponentType<MarkViewProps>
  options: Partial<ReactMarkViewRendererOptions>
}

/** Reads the marker off an `addMarkView()` result, if it carries one. */
export const getReactMarkViewMarker = (renderer: unknown): ReactMarkViewMarker | undefined =>
  (renderer as { [REACT_MARK_VIEW_MARKER]?: ReactMarkViewMarker } | null | undefined)?.[
    REACT_MARK_VIEW_MARKER
  ]

/**
 * The drop-in `ReactMarkViewRenderer`: use it inside an extension's
 * `addMarkView()` exactly like with `@tiptap/react`. This renderer never
 * invokes the returned constructor — `EditorContent` reads the component
 * off a marker and renders it inside the document tree instead.
 */
export function ReactMarkViewRenderer(
  component: ComponentType<MarkViewProps>,
  options: Partial<ReactMarkViewRendererOptions> = {},
): MarkViewRenderer {
  const renderer: MarkViewRenderer = () => {
    console.error(
      '[tiptap warn]: this ReactMarkViewRenderer comes from @tiptap/react-experimental, ' +
        'where mark views render through EditorContent — it cannot construct an imperative ' +
        'mark view for a non-React EditorView.',
    )
    return {} as unknown as ReturnType<MarkViewRenderer>
  }

  Object.defineProperty(renderer, REACT_MARK_VIEW_MARKER, {
    value: { component, options } satisfies ReactMarkViewMarker,
    enumerable: false,
  })

  return renderer
}

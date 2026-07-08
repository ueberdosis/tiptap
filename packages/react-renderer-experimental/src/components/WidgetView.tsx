/** @jsxImportSource react */
import type { Decoration } from '@tiptap/pm/view'
import type { ReactNode } from 'react'
import { useCallback, useLayoutEffect, useRef } from 'react'

import { useEditorContext } from '../contexts/EditorContext.js'
import { decorationInternals } from '../decorations/internals.js'
import { widgetComponent } from '../decorations/widget.js'
import { NOT_DIRTY, WidgetViewDesc } from '../viewdesc.js'

export interface WidgetViewProps {
  widget: Decoration
  /** Absolute document position of the widget. */
  pos: number
}

/**
 * Creates or refreshes the widget's desc against its rendered element and
 * returns helpers shared by both widget flavors.
 */
const useWidgetViewDesc = (widget: Decoration, domRef: { current: HTMLElement | null }) => {
  const descRef = useRef<WidgetViewDesc | undefined>(undefined)

  useLayoutEffect(() => {
    const dom = domRef.current

    if (!dom) {
      return
    }
    const existing = descRef.current

    if (existing && existing.dom === dom) {
      existing.widget = widget
      existing.dirty = NOT_DIRTY
      dom.pmViewDesc = existing
    } else {
      if (existing && existing.dom.pmViewDesc === existing) {
        existing.dom.pmViewDesc = undefined
      }
      descRef.current = new WidgetViewDesc(undefined, widget, dom)
    }

    // Mirror the base view's non-raw widget treatment (verified against
    // prosemirror-view 1.41.9): widgets are not editable and carry the
    // ProseMirror-widget class
    if (!widget.spec.raw) {
      dom.contentEditable = 'false'
      dom.classList.add('ProseMirror-widget')
    }
  })

  useLayoutEffect(
    () => () => {
      const desc = descRef.current

      if (!desc) {
        return
      }
      const destroy = desc.widget.spec.destroy as ((node: Node) => void) | undefined

      destroy?.(desc.dom)
      if (desc.dom.pmViewDesc === desc) {
        desc.dom.pmViewDesc = undefined
      }
    },
    [],
  )

  const getPos = useCallback(() => {
    const desc = descRef.current

    return desc?.parent ? desc.posBefore : undefined
  }, [])

  return { descRef, getPos }
}

/** A widget whose decoration was made with the package's `widget()` helper. */
function ReactWidgetView({ widget }: WidgetViewProps): ReactNode {
  const domRef = useRef<HTMLElement | null>(null)
  const { getPos } = useWidgetViewDesc(widget, domRef)
  const Component = widgetComponent(widget)

  if (!Component) {
    return null
  }
  return <Component widget={widget} getPos={getPos} ref={domRef} />
}

/**
 * A widget carrying a DOM node or `toDOM` factory. React cannot adopt live
 * DOM, so the widget is hosted inside a span; the desc sits on the host, so
 * mapping treats the pair as one zero-size unit.
 */
function NativeWidgetView({ widget }: WidgetViewProps): ReactNode {
  const { editor } = useEditorContext()
  const domRef = useRef<HTMLElement | null>(null)
  const { descRef, getPos } = useWidgetViewDesc(widget, domRef)
  const hostedRef = useRef<Decoration | null>(null)

  useLayoutEffect(() => {
    const host = domRef.current
    const desc = descRef.current

    if (!host || !desc) {
      return
    }
    // Reuse the hosted DOM while the widget type is unchanged (the deco
    // object itself is recreated by every position mapping)
    if (
      hostedRef.current &&
      decorationInternals(widget).type.eq(decorationInternals(hostedRef.current).type)
    ) {
      hostedRef.current = widget
      return
    }

    const { toDOM } = decorationInternals(widget).type
    const resolved =
      typeof toDOM === 'function' ? (editor ? toDOM(editor.view, getPos) : null) : toDOM

    host.replaceChildren()
    if (resolved) {
      host.appendChild(resolved)
    }
    hostedRef.current = widget
  })

  return <span ref={domRef} />
}

/** Dispatches a widget decoration to its React or native rendering. */
export function WidgetView(props: WidgetViewProps): ReactNode {
  return widgetComponent(props.widget) ? (
    <ReactWidgetView {...props} />
  ) : (
    <NativeWidgetView {...props} />
  )
}

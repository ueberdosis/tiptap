/** @jsxImportSource react */
import { getRenderedAttributes, updateMarkViewAttributes } from '@tiptap/core'
import type { Mark } from '@tiptap/pm/model'
import type { ReactNode } from 'react'
import { useCallback, useRef } from 'react'

import { useEditorContext } from '../contexts/EditorContext.js'
import { useMarkViewDesc } from '../hooks/useMarkViewDesc.js'
import { refSetter } from '../refs.js'
import type { MarkViewComponent } from './MarkViewComponentProps.js'

export interface ReactMarkViewProps {
  mark: Mark
  component: MarkViewComponent
  /** The inline content the mark spans (built by the MarkView dispatcher). */
  children?: ReactNode
}

/**
 * Renders a user React mark view component with the mark view contract and
 * keeps the mark's desc registered against the element the component
 * attaches `ref` to. No wrapper DOM, no portal.
 */
export function ReactMarkView({
  mark,
  component: Component,
  children,
}: ReactMarkViewProps): ReactNode {
  const { editor } = useEditorContext()
  const domRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  useMarkViewDesc(mark, domRef, contentRef)

  const updateAttributes = useCallback(
    (attributes: Record<string, unknown>) => {
      if (editor) {
        updateMarkViewAttributes(mark, editor, attributes)
      }
    },
    [editor, mark],
  )

  if (!editor) {
    throw new RangeError('[tiptap error]: React mark views can only render inside an EditorContent')
  }

  const HTMLAttributes = getRenderedAttributes(
    mark,
    editor.extensionManager.attributes.filter(attribute => attribute.type === mark.type.name),
  )

  return (
    <Component
      editor={editor}
      mark={mark}
      HTMLAttributes={HTMLAttributes}
      updateAttributes={updateAttributes}
      ref={refSetter(domRef)}
      contentDOMRef={refSetter(contentRef)}
    >
      {children}
    </Component>
  )
}

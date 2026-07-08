/** @jsxImportSource react */
import type { Mark } from '@tiptap/pm/model'
import type { ReactNode } from 'react'
import { useRef } from 'react'

import { useEditorContext } from '../contexts/EditorContext.js'
import { useMarkViewDesc } from '../hooks/useMarkViewDesc.js'
import { renderOutputSpec } from './OutputSpecView.js'
import { ReactMarkView } from './ReactMarkView.js'

export interface MarkViewProps {
  mark: Mark
  children?: ReactNode
}

/**
 * Renders a mark around a run of inline content: through the registered
 * React mark view component when one exists for the mark's type, otherwise
 * from its schema `toDOM` spec.
 */
export function MarkView({ mark, children }: MarkViewProps): ReactNode {
  const { markViews } = useEditorContext()
  const component = markViews[mark.type.name]

  if (component) {
    return (
      <ReactMarkView mark={mark} component={component}>
        {children}
      </ReactMarkView>
    )
  }
  return <SchemaMarkView mark={mark}>{children}</SchemaMarkView>
}

/**
 * The schema-rendered case. A layout effect keeps the mark's desc registered
 * against the rendered element; the parent node's child walk rebuilds its
 * children.
 */
function SchemaMarkView({ mark, children }: MarkViewProps): ReactNode {
  const domRef = useRef<Element | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  useMarkViewDesc(mark, domRef, contentRef)

  const spec = mark.type.spec.toDOM?.(mark, true)

  if (!spec) {
    throw new RangeError(
      `[tiptap error]: Mark type "${mark.type.name}" has no toDOM spec and no React mark view`,
    )
  }

  return renderOutputSpec(spec, { ref: domRef, contentRef, children })
}

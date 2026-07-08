import type { WidgetComponentProps } from '@tiptap/react-experimental'
import React from 'react'

/**
 * A widget decoration rendered as a plain React component (created through
 * the renderer's `widget()` helper — see Extension.ts).
 */
export default (props: WidgetComponentProps) => (
  <sup className="match-badge" ref={props.ref}>
    {props.widget.spec.index as number}
  </sup>
)

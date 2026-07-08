import type { MarkViewComponentProps } from '@tiptap/react-renderer-experimental'
import React from 'react'

/**
 * A plain component, no MarkViewContent and no portal: it renders its own
 * elements, attaches the mark view `ref` to the top-level one and
 * `contentDOMRef` to the element holding `children`.
 */
export default (props: MarkViewComponentProps<HTMLSpanElement>) => {
  const [count, setCount] = React.useState<number>(
    (props.HTMLAttributes['data-count'] as number) ?? 0,
  )

  return (
    <span
      className="content"
      data-test-id="mark-view"
      data-count={props.HTMLAttributes['data-count'] as number}
      ref={props.ref}
    >
      <span
        className="mark-view-content-wrapper"
        data-test-id="mark-view-content-wrapper"
        ref={props.contentDOMRef}
      >
        {props.children}
      </span>
      <label contentEditable={false}>
        React component:
        <button
          data-test-id="count-button"
          onClick={() => {
            setCount(count + 1)
          }}
        >
          This button has been clicked {count} times.
        </button>
        <button
          data-test-id="update-attributes-button"
          onClick={() => props.updateAttributes({ 'data-count': count })}
        >
          Update attributes
        </button>
      </label>
    </span>
  )
}

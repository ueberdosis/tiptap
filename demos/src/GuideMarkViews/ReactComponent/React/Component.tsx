import type { MarkViewRendererProps } from '@dibdab/react'
import { MarkViewContent } from '@dibdab/react'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (props: MarkViewRendererProps) => {
  const [count, setCount] = React.useState(props.HTMLAttributes['data-count'] ?? 0)

  return (
    <span className="content" data-test-id="mark-view" data-count={props.HTMLAttributes['data-count']}>
      <span className="mark-view-content-wrapper" data-test-id="mark-view-content-wrapper">
        <MarkViewContent />
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
        <button data-test-id="update-attributes-button" onClick={() => props.updateAttributes({ 'data-count': count })}>
          Update attributes
        </button>
      </label>
    </span>
  )
}

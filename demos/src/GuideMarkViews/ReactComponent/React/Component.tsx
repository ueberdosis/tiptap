import type { MarkViewRendererProps } from '@tiptap/react'
import { MarkViewContent } from '@tiptap/react'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (props: MarkViewRendererProps) => {
  const [count, setCount] = React.useState(0)

  return (
    <span className="content" data-test-id="mark-view">
      <MarkViewContent />
      <label contentEditable={false}>
        React component:
        <button
          onClick={() => {
            setCount(count + 1)
          }}
        >
          This button has been clicked {count} times.
        </button>
      </label>
    </span>
  )
}

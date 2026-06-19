import type { MarkViewProps } from '@tiptap/core'
import { MarkViewContent } from '@tiptap/solid'
import { createSignal } from 'solid-js'

export default function Component(props: MarkViewProps) {
  const [count, setCount] = createSignal(props.HTMLAttributes['data-count'] ?? 0)

  return (
    <span class="content" data-test-id="mark-view" data-count={props.HTMLAttributes['data-count']}>
      <span class="mark-view-content-wrapper" data-test-id="mark-view-content-wrapper">
        <MarkViewContent />
      </span>
      <label contenteditable={false}>
        Solid component:
        <button
          data-test-id="count-button"
          onClick={() => {
            setCount(count() + 1)
          }}
        >
          This button has been clicked {count()} times.
        </button>
        <button
          data-test-id="update-attributes-button"
          onClick={() => props.updateAttributes({ 'data-count': count() })}
        >
          Update attributes
        </button>
      </label>
    </span>
  )
}

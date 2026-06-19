import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export type MarkViewContentProps = JSX.HTMLAttributes<HTMLElement> & {
  as?: string
}

export function MarkViewContent(props: MarkViewContentProps) {
  const [local, rest] = splitProps(props, ['as'])

  return (
    <Dynamic
      component={local.as ?? 'span'}
      style={{ 'white-space': 'inherit' }}
      data-mark-view-content=""
      {...rest}
    />
  )
}

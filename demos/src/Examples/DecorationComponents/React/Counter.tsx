import type { ReactWidgetDecorationProps } from '@tiptap/react'
import React, { useState } from 'react'

interface CounterProps extends ReactWidgetDecorationProps {
  index: number
}

/**
 * A small interactive widget rendered into a ProseMirror widget decoration.
 *
 * It keeps its own `count` state. Because the widget is keyed by a stable id,
 * editing the document reuses this exact component instance instead of
 * remounting it — so the count survives while you type.
 */
export const Counter = ({ index }: CounterProps) => {
  const [count, setCount] = useState(0)

  return (
    <button className="decoration-counter" onClick={() => setCount(value => value + 1)}>
      ¶ {index + 1} · 👍 {count}
    </button>
  )
}

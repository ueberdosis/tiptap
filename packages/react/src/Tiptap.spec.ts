import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { Tiptap } from './Tiptap.js'

describe('Tiptap provider', () => {
  // Regression test for https://github.com/ueberdosis/tiptap/issues/7529
  // `useEditor()` returns `null` on the first render (and with
  // `immediatelyRender: false`), so the canonical `<Tiptap editor={editor}>`
  // usage must not throw. It should render nothing until the editor is ready.
  it('renders nothing instead of throwing when the editor is null', () => {
    let container: HTMLElement | undefined

    expect(() => {
      container = render(
        React.createElement(Tiptap, { editor: null }, React.createElement(Tiptap.Content)),
      ).container
    }).not.toThrow()

    expect(container?.firstChild).toBeNull()
  })
})

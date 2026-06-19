import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'solid-js/web'

import { BubbleMenu } from '../src/menus/BubbleMenu.js'

const { bubbleMenuPluginMock } = vi.hoisted(() => ({
  bubbleMenuPluginMock: vi.fn(() => ({ key: 'bubble-menu-plugin' })),
}))

vi.mock('@tiptap/extension-bubble-menu', () => ({
  BubbleMenuPlugin: bubbleMenuPluginMock,
}))

function createEditor() {
  return {
    isDestroyed: false,
    registerPlugin: vi.fn(),
    unregisterPlugin: vi.fn(),
    view: {
      dispatch: vi.fn(),
    },
    state: {
      tr: {
        setMeta: vi.fn(),
      },
    },
  }
}

describe('BubbleMenu', () => {
  beforeEach(() => {
    bubbleMenuPluginMock.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('registers the bubble menu plugin on mount', () => {
    const editor = createEditor()
    const target = document.createElement('div')

    document.body.appendChild(target)

    const dispose = render(
      () => (
        <BubbleMenu editor={editor as never} class="bubble-menu">
          <button type="button">Menu action</button>
        </BubbleMenu>
      ),
      target,
    )

    expect(editor.registerPlugin).toHaveBeenCalledTimes(1)
    expect(bubbleMenuPluginMock).toHaveBeenCalledTimes(1)

    dispose()
    expect(editor.unregisterPlugin).toHaveBeenCalledTimes(1)
  })
})

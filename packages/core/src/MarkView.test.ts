import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { createViewMutationTestContext } from '../tests/utils/createViewMutationTestContext.js'
import { MarkView } from './MarkView.js'
import type { MarkViewProps } from './types.js'

function createMarkView() {
  const context = createViewMutationTestContext()
  const { wrapper, contentDOM } = context

  class TestMarkView extends MarkView<null> {
    get dom() {
      return wrapper
    }

    get contentDOM() {
      return contentDOM
    }
  }

  const markView = new TestMarkView(null, {
    editor: { isFocused: true },
    mark: {},
    HTMLAttributes: {},
  } as unknown as MarkViewProps)

  return { markView, ...context }
}

describe('MarkView ignoreMutation on iOS', () => {
  afterEach(() => {
    document.body.replaceChildren()
    vi.unstubAllGlobals()
  })

  it('ignores framework chrome mounted inside dom outside contentDOM', () => {
    const { markView, chrome, createEditableChild, childListMutation } = createMarkView()
    const mounted = createEditableChild()

    chrome.append(mounted)

    expect(markView.ignoreMutation(childListMutation(chrome, [mounted]))).toBe(true)
  })

  it('lets ProseMirror handle childList mutations inside contentDOM', () => {
    const { markView, contentDOM, createEditableChild, childListMutation } = createMarkView()
    const edited = createEditableChild()

    contentDOM.append(edited)

    expect(markView.ignoreMutation(childListMutation(contentDOM, [edited]))).toBe(false)
  })
})

import type { ViewMutationRecord } from '@tiptap/pm/view'
import { vi } from 'vite-plus/test'

export function createViewMutationTestContext() {
  vi.stubGlobal('navigator', {
    platform: 'iPhone',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
  })

  const wrapper = document.createElement('div')
  const chrome = document.createElement('div')
  const contentDOM = document.createElement('div')

  wrapper.append(chrome, contentDOM)
  document.body.append(wrapper)

  return {
    wrapper,
    chrome,
    contentDOM,
    createEditableChild() {
      const child = document.createElement('div')

      child.contentEditable = 'true'

      return child
    },
    childListMutation(target: Node, added: HTMLElement[]) {
      return {
        type: 'childList',
        target,
        addedNodes: added,
        removedNodes: [],
      } as unknown as ViewMutationRecord
    },
  }
}

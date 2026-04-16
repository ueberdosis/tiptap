import { flip, shift } from '@floating-ui/dom'
import { ReactRenderer } from '@tiptap/react'

import { MentionList } from './MentionList.jsx'

export default {
  // 1. Native UI Layout Configuration
  placement: 'bottom-start',
  middlewares: [shift(), flip()],

  // 2. Click Boundary Configuration
  dismissOnOutsideClick: true,
  captureEscape: true,

  // 3. User Feed Rate limit configurations
  debounce: 250,
  minQueryLength: 1,

  // 4. Fallback items before async fetching starts
  initialItems: () => ['Lea Thompson', 'Cyndi Lauper', 'Tom Cruise'],

  // 5. Sophisticated asynchronous retrieval handling
  items: async ({ query, signal }) => {
    // Fake a slow API network call to clearly demonstrate loading UI
    await new Promise(r => {
      setTimeout(r, 600)
    })

    if (signal?.aborted) {
      return []
    }

    return [
      'Lea Thompson',
      'Cyndi Lauper',
      'Tom Cruise',
      'Madonna',
      'Jerry Hall',
      'Joan Collins',
      'Winona Ryder',
      'Christina Applegate',
      'Alyssa Milano',
      'Molly Ringwald',
      'Ally Sheedy',
      'Debbie Harry',
      'Olivia Newton-John',
      'Elton John',
      'Michael J. Fox',
      'Axl Rose',
      'Emilio Estevez',
      'Ralph Macchio',
      'Rob Lowe',
      'Jennifer Grey',
      'Mickey Rourke',
      'John Cusack',
      'Matthew Broderick',
      'Justine Bateman',
      'Lisa Bonet',
    ]
      .filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5)
  },

  render: () => {
    let reactRenderer

    return {
      onStart: props => {
        if (!props.clientRect) {
          return
        }

        reactRenderer = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        // Tiptap native popup registry (auto-calculates positions handling scroll+resize)
        props.setPopupElement(reactRenderer.element)

        // Ensure DOM handles standard rendering behavior typically required for porting root popups
        // Alternatively set via configuration if natively supported in a plugin framework root tree
        document.body.appendChild(reactRenderer.element)
      },

      onUpdate(props) {
        reactRenderer?.updateProps(props)
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          reactRenderer?.destroy()
          reactRenderer?.element?.remove()

          return true
        }

        return reactRenderer?.ref?.onKeyDown(props) || false
      },

      onExit() {
        reactRenderer?.destroy()
        reactRenderer?.element?.remove()
      },
    }
  },
}

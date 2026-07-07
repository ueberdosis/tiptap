import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Schema } from '@tiptap/pm/model'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'

// React's act() checks this global to run effects synchronously
;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

export const testSchema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0],
    },
    blockquote: {
      group: 'block',
      content: 'block+',
      parseDOM: [{ tag: 'blockquote' }],
      toDOM: () => ['blockquote', { class: 'quote', 'data-kind': 'note' }, 0],
    },
    // Fixed child order, for testing commands against content expressions
    section: {
      group: 'block',
      content: 'paragraph blockquote',
      parseDOM: [{ tag: 'section' }],
      toDOM: () => ['section', 0],
    },
    hardBreak: {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM: () => ['br'],
    },
    text: { group: 'inline' },
  },
})

export const p = (...content: (string | ProseMirrorNode)[]) =>
  testSchema.node(
    'paragraph',
    null,
    content.map(child => (typeof child === 'string' ? testSchema.text(child) : child)),
  )
export const bq = (...content: ProseMirrorNode[]) => testSchema.node('blockquote', null, content)
export const br = () => testSchema.node('hardBreak')
export const doc = (...content: ProseMirrorNode[]) => testSchema.node('doc', null, content)

const roots: { root: Root; container: HTMLElement }[] = []

/** Creates a tracked React root in the document; clean up via `unmountTrackedRoots`. */
export const mountTrackedRoot = (): { root: Root; container: HTMLElement } => {
  const container = document.createElement('div')

  document.body.appendChild(container)
  const root = createRoot(container)

  roots.push({ root, container })
  return { root, container }
}

/** Unmounts every tracked root; register as an `afterEach` in test files. */
export const unmountTrackedRoots = async (): Promise<void> => {
  while (roots.length) {
    const { root, container } = roots.pop() as { root: Root; container: HTMLElement }

    await act(async () => root.unmount())
    container.remove()
  }
}

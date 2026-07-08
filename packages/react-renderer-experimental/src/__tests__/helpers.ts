import type { EditorInternalOptions, EditorOptions } from '@tiptap/core'
import { Editor, Node as TiptapNode } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Schema } from '@tiptap/pm/model'
import { act, createElement } from 'react'
import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'

import { EditorContent } from '../components/EditorContent.js'
import type { MarkViewComponent } from '../components/MarkViewComponentProps.js'
import type { NodeViewComponent } from '../components/NodeViewComponentProps.js'
import { ReactRendererExtension } from '../extension.js'
import { ReactEditorView } from '../ReactEditorView.js'

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
  marks: {
    bold: {
      parseDOM: [{ tag: 'strong' }],
      toDOM: () => ['strong', 0],
    },
    italic: {
      parseDOM: [{ tag: 'em' }],
      toDOM: () => ['em', 0],
    },
  },
})

/** Text with marks applied, e.g. `marked('x', 'bold', 'italic')`. */
export const marked = (text: string, ...markNames: string[]) =>
  testSchema.text(
    text,
    markNames.map(name => testSchema.marks[name].create()),
  )

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

/** Minimal Tiptap node extensions matching the doc/paragraph/text schema. */
export const tiptapTestNodes = [
  TiptapNode.create({ name: 'doc', topNode: true, content: 'block+' }),
  TiptapNode.create({
    name: 'paragraph',
    group: 'block',
    content: 'inline*',
    parseHTML: () => [{ tag: 'p' }],
    renderHTML: () => ['p', 0],
  }),
  TiptapNode.create({ name: 'text', group: 'inline' }),
]

/** Creates a React-renderer editor and mounts `EditorContent` for it. */
export const renderTiptapEditor = async (
  content: string,
  extensions: EditorOptions['extensions'] = [],
  nodeViews?: Record<string, NodeViewComponent>,
  markViews?: Record<string, MarkViewComponent>,
) => {
  const editorOptions: Partial<EditorOptions> & EditorInternalOptions = {
    element: null,
    content,
    extensions: [...tiptapTestNodes, ReactRendererExtension, ...extensions],
    __internalViewFactory: (element, props) => new ReactEditorView(element as HTMLElement, props),
  }
  const editor = new Editor(editorOptions)
  const { root, container } = mountTrackedRoot()

  await act(async () => {
    root.render(createElement(EditorContent, { editor, nodeViews, markViews }))
  })

  return {
    editor,
    root,
    container,
    get dom() {
      return container.firstElementChild as HTMLDivElement
    },
    get view() {
      return editor.view as ReactEditorView
    },
  }
}

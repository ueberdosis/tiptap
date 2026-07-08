import type { Editor, NodeConfig } from '@tiptap/core'
import { getExtensionField, getNodeType, splitExtensions } from '@tiptap/core'

import type { NodeViewComponent } from './components/NodeViewComponentProps.js'
import { getReactNodeViewMarker, reactNodeViewComponent } from './ReactNodeViewRenderer.js'

const warnedTypes = new Set<string>()

const warnUnsupportedView = (kind: 'node' | 'mark', name: string): void => {
  const key = `${kind}:${name}`

  if (warnedTypes.has(key)) {
    return
  }
  warnedTypes.add(key)
  console.warn(
    `[tiptap warn]: the ${kind} view for "${name}" is an imperative constructor the React ` +
      `renderer cannot host — it falls back to the schema's toDOM rendering. Use ` +
      `ReactNodeViewRenderer/ReactMarkViewRenderer from @tiptap/react-experimental, or pass a ` +
      `component via the EditorContent ${kind}Views prop.`,
  )
}

/** Extensions never change on a live editor, so collection runs once per instance. */
const nodeViewCache = new WeakMap<Editor, Record<string, NodeViewComponent>>()

/**
 * Collects React node view components registered through extensions'
 * `addNodeView: () => ReactNodeViewRenderer(Component)`. The renderer never
 * calls `ExtensionManager.nodeViews` (which wraps every constructor in a
 * fresh closure, hiding the component); instead the marker is read off the
 * raw `addNodeView()` result — invoked with the same bound context
 * `ExtensionManager` would build — and the component renders through the
 * document tree.
 */
export const collectReactNodeViews = (editor: Editor): Record<string, NodeViewComponent> => {
  const cached = nodeViewCache.get(editor)

  if (cached) {
    return cached
  }

  const { nodeExtensions } = splitExtensions(editor.extensionManager.extensions)
  const collected: Record<string, NodeViewComponent> = {}

  nodeExtensions.forEach(extension => {
    if (!getExtensionField(extension, 'addNodeView')) {
      return
    }
    const context = {
      name: extension.name,
      options: extension.options,
      storage: editor.extensionStorage[extension.name as keyof typeof editor.extensionStorage],
      editor,
      type: getNodeType(extension.name, editor.schema),
    }
    const addNodeView = getExtensionField<NodeConfig['addNodeView']>(
      extension,
      'addNodeView',
      context,
    )
    const result = addNodeView?.()

    if (!result) {
      return
    }
    const marker = getReactNodeViewMarker(result)

    if (!marker) {
      warnUnsupportedView('node', extension.name)
      return
    }
    collected[extension.name] = reactNodeViewComponent(marker.component, marker.options)
  })

  nodeViewCache.set(editor, collected)
  return collected
}

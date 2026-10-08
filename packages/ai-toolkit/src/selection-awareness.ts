import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type * as Y from 'yjs'

/** The provider awareness surface used to publish AI selections. */
export type AiSelectionProvider = {
  awareness?: {
    getLocalState(): Record<string, unknown> | null
    setLocalStateField(field: string, value: unknown): void
  } | null
}

/** Configuration for {@link AiSelectionAwareness}. */
export type AiSelectionAwarenessOptions = {
  /** The provider connected to the editor's collaborative document. */
  provider: AiSelectionProvider | null
  /** The user ID passed to the server as `tool.config.user`. */
  userId: string
  /** Receives initialization failures. Defaults to logging the error to the console. */
  onError?: (error: Error) => void
}

type SelectionEntry = {
  userId: string
  anchor: ReturnType<typeof Y.relativePositionToJSON> | null
  head: ReturnType<typeof Y.relativePositionToJSON> | null
}

function readFields(state: Record<string, unknown>): Record<string, unknown> {
  const value = state.aiToolkitSelection
  if (!value || typeof value !== 'object' || !('fields' in value)) return {}
  const fields = value.fields
  return fields && typeof fields === 'object' && !Array.isArray(fields)
    ? Object.fromEntries(Object.entries(fields))
    : {}
}

/**
 * Publishes a selection per collaborative field and retains it when the editor blurs.
 * Requires Collaboration and a provider for the same Y.Doc; no caret extension is needed.
 *
 * @example
 * ServerAiToolkit.configure({ selectionAwareness: { provider, userId: 'user-1' } })
 */
export const AiSelectionAwareness = Extension.create<AiSelectionAwarenessOptions>({
  name: 'aiSelectionAwareness',

  addOptions() {
    return { provider: null, userId: '' }
  },

  onBeforeCreate() {
    if (!this.options.provider?.awareness || !this.options.userId.trim()) {
      throw new Error(
        'ServerAiToolkit selectionAwareness requires provider.awareness and a non-empty userId',
      )
    }
  },

  async onCreate() {
    const awareness = this.options.provider?.awareness
    const userId = this.options.userId.trim()
    if (!awareness) return

    try {
      // Keep collaboration peers optional for existing non-collaborative editors.
      const [{ absolutePositionToRelativePosition, ySyncPluginKey }, Y] = await Promise.all([
        import('@tiptap/y-tiptap'),
        import('yjs'),
      ])
      if (this.editor.isDestroyed) return

      this.editor.registerPlugin(
        new Plugin({
          key: new PluginKey('aiSelectionAwareness'),
          view: view => {
            let field: string | undefined

            const write = (entry: SelectionEntry) => {
              const state = awareness.getLocalState()
              if (!state || field === undefined) return
              const fields = readFields(state)
              if (JSON.stringify(fields[field]) === JSON.stringify(entry)) return
              awareness.setLocalStateField('aiToolkitSelection', {
                version: 1,
                fields: { ...fields, [field]: entry },
              })
            }

            const publish = () => {
              const sync = ySyncPluginKey.getState(view.state)
              if (!sync?.binding) return
              const doc: Y.Doc = sync.doc
              field = Array.from(doc.share).find(([, type]) => type === sync.type)?.[0]
              if (field === undefined) {
                throw new Error(
                  'AiSelectionAwareness requires a named collaborative document field',
                )
              }
              const { anchor, head } = view.state.selection
              write({
                userId,
                anchor: Y.relativePositionToJSON(
                  absolutePositionToRelativePosition(anchor, sync.type, sync.binding.mapping),
                ),
                head: Y.relativePositionToJSON(
                  absolutePositionToRelativePosition(head, sync.type, sync.binding.mapping),
                ),
              })
            }

            publish()
            view.dom.addEventListener('focusin', publish)

            return {
              update: (_, previous) => {
                const sync = ySyncPluginKey.getState(view.state)
                // Keep the relative positions during remote edits while the user is in chat.
                if (sync?.isChangeOrigin && !view.hasFocus()) return
                if (
                  !previous.selection.eq(view.state.selection) ||
                  previous.doc !== view.state.doc
                ) {
                  publish()
                }
              },
              destroy: () => {
                view.dom.removeEventListener('focusin', publish)
                write({ userId, anchor: null, head: null })
              },
            }
          },
        }),
      )
    } catch (cause) {
      const error = new Error('ServerAiToolkit selectionAwareness failed to initialize', { cause })
      if (this.options.onError) {
        this.options.onError(error)
      } else {
        console.error(error)
      }
    }
  },
})

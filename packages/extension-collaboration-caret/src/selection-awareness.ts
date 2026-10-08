import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { absolutePositionToRelativePosition, ySyncPluginKey } from '@tiptap/y-tiptap'
import * as Y from 'yjs'

/** The provider awareness surface used to publish AI selections. */
type AiSelectionProvider = {
  awareness?: {
    getLocalState(): Record<string, any> | null
    on(event: string, listener: () => void): void
    off(event: string, listener: () => void): void
    setLocalStateField(field: string, value: unknown): void
  } | null
}

/** Configuration for {@link AiSelectionAwareness}. */
type AiSelectionAwarenessOptions = {
  /** The provider connected to the editor's collaborative document. */
  provider: AiSelectionProvider | null
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
 * Registered internally by CollaborationCaret using its provider and awareness user ID.
 *
 * @example
 * CollaborationCaret.configure({ provider, user: { id: 'user-1' } })
 */
export const AiSelectionAwareness = Extension.create<AiSelectionAwarenessOptions>({
  name: 'aiSelectionAwareness',

  addOptions() {
    return { provider: null }
  },

  onCreate() {
    const awareness = this.options.provider?.awareness
    if (!awareness) return

    try {
      this.editor.registerPlugin(
        new Plugin({
          key: new PluginKey('aiSelectionAwareness'),
          view: view => {
            let field: string | undefined
            let userId: string | undefined
            const currentUserId = () => {
              const id = awareness.getLocalState()?.user?.id
              return typeof id === 'string' && id.length > 0 ? id : undefined
            }

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
              const nextUserId = currentUserId()
              if (!nextUserId) {
                const previousUserId = userId
                userId = undefined
                if (previousUserId) write({ userId: previousUserId, anchor: null, head: null })
                return
              }
              userId = nextUserId
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
            const onAwarenessUpdate = () => {
              if (currentUserId() !== userId) publish()
            }
            awareness.on('update', onAwarenessUpdate)

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
                awareness.off('update', onAwarenessUpdate)
                if (userId) write({ userId, anchor: null, head: null })
              },
            }
          },
        }),
      )
    } catch (cause) {
      const error = new Error('AiSelectionAwareness failed to initialize', { cause })
      console.error(error)
    }
  },
})

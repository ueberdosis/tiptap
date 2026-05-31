import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import type { Editor } from '../../Editor.js'
import type { DecorationDescriptor, DecorationMeta, DecorationSpec } from './types.js'

/**
 * The shared plugin key for the centralized decoration manager. Used by the
 * imperative `updateDecorations` / `clearDecorations` commands to send meta.
 */
export const decorationManagerKey = new PluginKey<DecorationManagerState>('tiptapDecorations')

/**
 * A resolved `addDecorations` descriptor paired with the extension it came from.
 */
export interface ResolvedDecorationEntry {
  name: string
  spec: DecorationSpec
}

interface DecorationManagerState {
  /**
   * Each extension's decorations, kept separate so that an extension can be
   * recomputed while the rest are cheaply mapped through the transaction.
   */
  sets: Record<string, DecorationSet>
  /**
   * The union of all extension sets, exposed to the editor view.
   */
  combined: DecorationSet
}

function toProseMirrorDecorations(descriptors: DecorationDescriptor[]): Decoration[] {
  return descriptors.map(descriptor => {
    switch (descriptor.kind) {
      case 'node':
        return Decoration.node(descriptor.from, descriptor.to, descriptor.attrs, descriptor.spec)
      case 'inline':
        return Decoration.inline(descriptor.from, descriptor.to, descriptor.attrs, descriptor.spec)
      case 'widget':
        return Decoration.widget(descriptor.pos, descriptor.render, {
          ...descriptor.spec,
          key: descriptor.key,
        })
      default:
        // unreachable for valid descriptors.
        return descriptor as never
    }
  })
}

function combineSets(doc: EditorState['doc'], sets: Record<string, DecorationSet>): DecorationSet {
  const decorations: Decoration[] = []

  Object.keys(sets).forEach(name => {
    decorations.push(...sets[name].find())
  })

  return DecorationSet.create(doc, decorations)
}

/**
 * Builds the single ProseMirror plugin that aggregates all extensions'
 * declarative decorations into one `DecorationSet`.
 *
 * - On `init`, every extension's `create` runs to produce its initial set.
 * - On `apply`, each extension is either recomputed (when `shouldUpdate`
 *   returns `true`, or by default when the document changed) or its previous
 *   set is mapped forward through the transaction.
 * - Transaction meta (sent by `updateDecorations` / `clearDecorations`) can
 *   force a recompute of one/all extensions, or clear everything.
 */
export function createDecorationPlugin(
  editor: Editor,
  entries: ResolvedDecorationEntry[],
): Plugin<DecorationManagerState> {
  const buildSet = (state: EditorState, name: string, spec: DecorationSpec): DecorationSet => {
    const descriptors = spec.create({ editor, state, view: editor.view })

    return DecorationSet.create(state.doc, toProseMirrorDecorations(descriptors))
  }

  return new Plugin<DecorationManagerState>({
    key: decorationManagerKey,
    state: {
      init: (_config, state) => {
        const sets: Record<string, DecorationSet> = {}

        entries.forEach(({ name, spec }) => {
          sets[name] = buildSet(state, name, spec)
        })

        return { sets, combined: combineSets(state.doc, sets) }
      },
      apply: (tr, previous, oldState, newState) => {
        const meta = tr.getMeta(decorationManagerKey) as DecorationMeta | undefined

        if (meta?.type === 'clear') {
          return { sets: {}, combined: DecorationSet.empty }
        }

        const forceAll = meta?.type === 'force' && !meta.name
        const forceName = meta?.type === 'force' ? meta.name : undefined

        const sets: Record<string, DecorationSet> = {}
        let recomputed = false

        entries.forEach(({ name, spec }) => {
          const shouldUpdate =
            forceAll ||
            forceName === name ||
            (spec.shouldUpdate
              ? spec.shouldUpdate({ editor, tr, oldState, newState })
              : tr.docChanged)

          if (shouldUpdate) {
            sets[name] = buildSet(newState, name, spec)
            recomputed = true
          } else {
            const previousSet = previous.sets[name] ?? DecorationSet.empty

            sets[name] = previousSet.map(tr.mapping, tr.doc)
          }
        })

        // Nothing was recomputed and positions did not move — reuse the
        // previous state so the view doesn't see a decoration change.
        if (!recomputed && !tr.docChanged) {
          return previous
        }

        return { sets, combined: combineSets(newState.doc, sets) }
      },
    },
    props: {
      decorations(state) {
        return decorationManagerKey.getState(state)?.combined ?? DecorationSet.empty
      },
    },
  })
}

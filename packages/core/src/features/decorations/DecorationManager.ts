import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import type { Editor } from '../../Editor.js'
import type { DecorationDescriptor, DecorationMeta, DecorationSpec } from './types.js'

/**
 * The shared plugin key for the centralized decoration manager. Internal - used
 * by the imperative commands and the {@link liveWidgetKeys} helper.
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
   * Each extension's decoration set, keyed by extension name. Kept separate so
   * that one extension can be recomputed while the rest are cheaply mapped
   * through the transaction.
   */
  decorationSetsByExtension: Record<string, DecorationSet>
  /**
   * The union of every extension's set, handed to the editor view.
   */
  mergedDecorationSet: DecorationSet
  /**
   * The keys of every widget decoration currently live. Framework widget
   * renderers read this (via {@link liveWidgetKeys}) to decide whether a widget
   * being torn down by ProseMirror is genuinely gone or just being reassigned.
   */
  widgetKeys: Set<string>
}

const EMPTY_KEYS: ReadonlySet<string> = new Set()

/**
 * Returns the keys of all widget decorations currently rendered for this editor.
 * Used by the React/Vue widget renderers to avoid tearing down a renderer whose
 * key is still live (e.g. when a key is reassigned to a new position).
 */
export function liveWidgetKeys(editor: Editor): ReadonlySet<string> {
  return decorationManagerKey.getState(editor.state)?.widgetKeys ?? EMPTY_KEYS
}

/**
 * Converts framework-agnostic descriptors into ProseMirror decorations.
 */
function descriptorsToDecorations(descriptors: DecorationDescriptor[]): Decoration[] {
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

/**
 * Merges every extension's decoration set into one and collects the keys of all
 * widget decorations in a single pass.
 *
 * This merge runs once per transaction that changed document content or triggered
 * a recompute. It calls `set.find()` on each extension's set, then creates a new
 * combined set from the flat array. For typical usage (a few extensions, dozens
 * to hundreds of decorations) this is cheap.
 *
 * If you have many decorations or extensions that produce them cheaply,
 * use `shouldUpdate` to gate recomputation and avoid unnecessary merges.
 * Extensions with expensive `create()` should gate aggressively.
 *
 * @param doc - The current document, used as the base for the merged set.
 * @param decorationSetsByExtension - Each extension's decoration set, keyed by
 *   extension name.
 * @returns The `mergedDecorationSet` handed to the editor view and the
 *   `widgetKeys` of every widget decoration currently live.
 */
function mergeDecorationSets(
  doc: EditorState['doc'],
  decorationSetsByExtension: Record<string, DecorationSet>,
): { mergedDecorationSet: DecorationSet; widgetKeys: Set<string> } {
  // Intentionally simple: flatMap + create is O(N) in total decorations.
  // Per-extension shouldUpdate gates and the short-circuit below prevent
  // unnecessary runs. If this becomes a hot path, consider a delta-based
  // merge or incremental set building.
  const allDecorations = Object.values(decorationSetsByExtension).flatMap(set => set.find())
  const widgetKeys = new Set<string>()

  for (const decoration of allDecorations) {
    const key = (decoration.spec as { key?: unknown } | undefined)?.key

    if (typeof key === 'string') {
      widgetKeys.add(key)
    }
  }

  return { mergedDecorationSet: DecorationSet.create(doc, allDecorations), widgetKeys }
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
  decorationEntries: ResolvedDecorationEntry[],
): Plugin<DecorationManagerState> {
  const buildExtensionDecorationSet = (state: EditorState, spec: DecorationSpec): DecorationSet => {
    const descriptors = spec.create({ editor, state, view: editor.view })

    return DecorationSet.create(state.doc, descriptorsToDecorations(descriptors))
  }

  return new Plugin<DecorationManagerState>({
    key: decorationManagerKey,
    state: {
      init: (_config, state) => {
        const decorationSetsByExtension: Record<string, DecorationSet> = {}

        for (const { name, spec } of decorationEntries) {
          decorationSetsByExtension[name] = buildExtensionDecorationSet(state, spec)
        }

        return {
          decorationSetsByExtension,
          ...mergeDecorationSets(state.doc, decorationSetsByExtension),
        }
      },
      apply: (tr, previous, oldState, newState) => {
        const meta = tr.getMeta(decorationManagerKey) as DecorationMeta | undefined

        const forceAll = meta?.type === 'force' && !meta.name
        const forceName = meta?.type === 'force' ? meta.name : undefined

        const decorationSetsByExtension: Record<string, DecorationSet> = {}
        let recomputed = false

        for (const { name, spec } of decorationEntries) {
          const shouldUpdate =
            forceAll ||
            forceName === name ||
            (spec.shouldUpdate
              ? spec.shouldUpdate({ editor, tr, oldState, newState })
              : tr.docChanged)

          if (shouldUpdate) {
            decorationSetsByExtension[name] = buildExtensionDecorationSet(newState, spec)
            recomputed = true
          } else {
            const previousSet = previous.decorationSetsByExtension[name] ?? DecorationSet.empty

            decorationSetsByExtension[name] = previousSet.map(tr.mapping, tr.doc)
          }
        }

        // Nothing was recomputed and positions did not move — reuse the
        // previous state so the view doesn't see a decoration change.
        if (!recomputed && !tr.docChanged) {
          return previous
        }

        return {
          decorationSetsByExtension,
          ...mergeDecorationSets(newState.doc, decorationSetsByExtension),
        }
      },
    },
    props: {
      decorations(state) {
        return decorationManagerKey.getState(state)?.mergedDecorationSet ?? DecorationSet.empty
      },
    },
  })
}

import { EditorState, Plugin, PluginKey, Transaction } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import type { Editor } from '../../Editor.js'
import { getChangedRanges } from '../../helpers/getChangedRanges.js'
import type { Range } from '../../types.js'
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
   * Each extension's live widget keys, keyed by extension name. Collected while
   * building decorations (widget descriptors carry their key) so the merged
   * {@link widgetKeys} is a cheap union instead of a full scan of the built set.
   */
  widgetKeysByExtension: Record<string, Set<string>>
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
 * Converts framework-agnostic descriptors into ProseMirror decorations and, in
 * the same pass, collects the keys of any widget decorations. Widget descriptors
 * carry their `key`, so gathering keys here avoids a separate scan of the built
 * set (which would re-walk the whole document).
 *
 * Warns (without throwing) when an extension produces two widget decorations
 * with the same `key` in a single build: ProseMirror requires globally unique
 * widget keys and misplaces the DOM otherwise, so catching it here with the
 * extension name is friendlier than the eventual hard failure.
 */
function descriptorsToDecorations(
  descriptors: DecorationDescriptor[],
  extensionName?: string,
): {
  decorations: Decoration[]
  widgetKeys: Set<string>
} {
  const decorations: Decoration[] = []
  const widgetKeys = new Set<string>()

  for (const descriptor of descriptors) {
    switch (descriptor.kind) {
      case 'node':
        decorations.push(
          Decoration.node(descriptor.from, descriptor.to, descriptor.attrs, descriptor.spec),
        )
        break
      case 'inline':
        decorations.push(
          Decoration.inline(descriptor.from, descriptor.to, descriptor.attrs, descriptor.spec),
        )
        break
      case 'widget':
        if (widgetKeys.has(descriptor.key)) {
          console.warn(
            `[tiptap warn]: Duplicate widget decoration key "${descriptor.key}"` +
              (extensionName ? ` in extension "${extensionName}"` : '') +
              '. Widget decoration keys must be globally unique, otherwise ProseMirror ' +
              'misplaces the widget DOM. Use a stable, unique key (e.g. `comment-${id}`).',
          )
        }

        decorations.push(
          Decoration.widget(descriptor.pos, descriptor.render, {
            ...descriptor.spec,
            key: descriptor.key,
          }),
        )
        widgetKeys.add(descriptor.key)
        break
      default:
        // unreachable for valid descriptors.
        break
    }
  }

  return { decorations, widgetKeys }
}

/**
 * Builds one extension's decoration set from its descriptors.
 *
 * `DecorationSet.create` runs ProseMirror's `buildTree`, which walks the entire
 * document tree to distribute decorations — it is O(document size), not
 * O(decoration count). Callers should therefore avoid rebuilding sets they can
 * cheaply map forward instead (see the incremental path below).
 *
 * @param doc - The current document, used as the base for the built set.
 * @param descriptors - The framework-agnostic descriptors returned by `create`.
 * @param extensionName - The owning extension's name, used in duplicate-key warnings.
 * @returns The extension's `set` and the `widgetKeys` it contains.
 */
function buildDecorationSet(
  doc: EditorState['doc'],
  descriptors: DecorationDescriptor[],
  extensionName?: string,
): { set: DecorationSet; widgetKeys: Set<string> } {
  const { decorations, widgetKeys } = descriptorsToDecorations(descriptors, extensionName)

  return { set: DecorationSet.create(doc, decorations), widgetKeys }
}

/**
 * Returns the widget `key` of a decoration, or `undefined` if it has none.
 */
function widgetKeyOf(decoration: Decoration): string | undefined {
  const key = (decoration.spec as { key?: unknown } | undefined)?.key

  return typeof key === 'string' ? key : undefined
}

/**
 * Expands the document-changing ranges of a transaction to the boundaries of the
 * top-level blocks they touch, then merges overlapping results.
 *
 * A text match cannot span a block boundary, so block-aligned ranges fully
 * contain every match affected by the edit — even one that straddles the raw
 * edit position (e.g. typing in the middle of a word). This is what lets the
 * incremental path rescan only the touched blocks instead of the whole document.
 */
function getBlockAlignedChangedRanges(tr: Transaction, doc: EditorState['doc']): Range[] {
  const ranges: Range[] = []

  for (const { newRange } of getChangedRanges(tr)) {
    let from: number | null = null
    let to = 0

    // Include every top-level block whose span intersects the changed range.
    doc.forEach((node, offset) => {
      const nodeStart = offset
      const nodeEnd = offset + node.nodeSize

      if (nodeEnd >= newRange.from && nodeStart <= newRange.to) {
        if (from === null) {
          from = nodeStart
        }

        to = nodeEnd
      }
    })

    if (from !== null) {
      ranges.push({ from, to })
    }
  }

  // Merge overlapping/adjacent ranges so a block is never patched twice.
  ranges.sort((a, b) => a.from - b.from)

  const merged: Range[] = []

  for (const range of ranges) {
    const last = merged[merged.length - 1]

    if (last && range.from <= last.to) {
      last.to = Math.max(last.to, range.to)
    } else {
      merged.push({ ...range })
    }
  }

  return merged
}

/**
 * Unions every extension's widget keys into the single set framework widget
 * renderers read via {@link liveWidgetKeys}. Cheap — it iterates the per-extension
 * key sets, never the built decoration tree.
 */
function unionWidgetKeys(widgetKeysByExtension: Record<string, Set<string>>): Set<string> {
  const merged = new Set<string>()

  for (const keys of Object.values(widgetKeysByExtension)) {
    for (const key of keys) {
      merged.add(key)
    }
  }

  return merged
}

/**
 * Merges every extension's decoration set into one. Runs ProseMirror's
 * `buildTree` once over the flattened decorations, so it is O(document size).
 * Only used when more than one extension produced decorations and at least one
 * recomputed — the single-extension and map-forward paths avoid it entirely.
 */
function mergeDecorationSets(
  doc: EditorState['doc'],
  decorationSetsByExtension: Record<string, DecorationSet>,
): DecorationSet {
  const allDecorations = Object.values(decorationSetsByExtension).flatMap(set => set.find())

  return DecorationSet.create(doc, allDecorations)
}

/**
 * Builds the single ProseMirror plugin that aggregates all extensions'
 * declarative decorations into one `DecorationSet`.
 *
 * - On `init`, every extension's `create` runs to produce its initial set.
 * - On `apply`, each extension is either recomputed (when `shouldUpdate`
 *   returns `true`, or by default when the document changed) or its previous
 *   set is mapped forward through the transaction. Extensions that opt into
 *   `incrementalCreate` map their previous set forward and rebuild only the
 *   blocks the edit touched via `createInRange`, instead of rebuilding the
 *   whole set with `create`.
 * - Transaction meta (sent by `updateDecorations`) can force a recompute of
 *   one or all extensions.
 */
export function createDecorationPlugin(
  editor: Editor,
  decorationEntries: ResolvedDecorationEntry[],
): Plugin<DecorationManagerState> {
  // When a single extension declares decorations (the common case) the merged
  // set is identical to that extension's set, so we hand it through directly and
  // skip the flatten + `DecorationSet.create` rebuild entirely.
  const singleExtensionName = decorationEntries.length === 1 ? decorationEntries[0].name : undefined

  const buildExtensionDecorationSet = (
    state: EditorState,
    spec: DecorationSpec,
    name: string,
  ): { set: DecorationSet; widgetKeys: Set<string> } => {
    const descriptors = spec.create({ editor, state, view: editor.view })

    return buildDecorationSet(state.doc, descriptors, name)
  }

  return new Plugin<DecorationManagerState>({
    key: decorationManagerKey,
    state: {
      init: (_config, state) => {
        const decorationSetsByExtension: Record<string, DecorationSet> = {}
        const widgetKeysByExtension: Record<string, Set<string>> = {}

        for (const { name, spec } of decorationEntries) {
          const { set, widgetKeys } = buildExtensionDecorationSet(state, spec, name)

          decorationSetsByExtension[name] = set
          widgetKeysByExtension[name] = widgetKeys
        }

        const mergedDecorationSet = singleExtensionName
          ? decorationSetsByExtension[singleExtensionName]
          : mergeDecorationSets(state.doc, decorationSetsByExtension)

        return {
          decorationSetsByExtension,
          widgetKeysByExtension,
          mergedDecorationSet,
          widgetKeys: unionWidgetKeys(widgetKeysByExtension),
        }
      },
      apply: (tr, previous, oldState, newState) => {
        const meta = tr.getMeta(decorationManagerKey) as DecorationMeta | undefined

        const forceAll = meta?.type === 'force' && !meta.name
        const forceName = meta?.type === 'force' ? meta.name : undefined

        const decorationSetsByExtension: Record<string, DecorationSet> = {}
        const widgetKeysByExtension: Record<string, Set<string>> = {}
        let recomputed = false

        for (const { name, spec } of decorationEntries) {
          const forced = forceAll || forceName === name
          const wantsRecompute =
            forced ||
            (spec.shouldUpdate
              ? spec.shouldUpdate({ editor, tr, oldState, newState })
              : tr.docChanged)

          if (!wantsRecompute) {
            const previousSet = previous.decorationSetsByExtension[name] ?? DecorationSet.empty
            const widgetKeys = new Set(previous.widgetKeysByExtension[name])

            // Map the set forward and prune the keys of any widget dropped
            // because its position was deleted. The map walks the set's own
            // structure (≈O(decorations)), not the whole document.
            decorationSetsByExtension[name] = previousSet.map(tr.mapping, tr.doc, {
              onRemove: removedSpec => {
                const key = (removedSpec as { key?: unknown } | undefined)?.key

                if (typeof key === 'string') {
                  widgetKeys.delete(key)
                }
              },
            })
            widgetKeysByExtension[name] = widgetKeys
          } else if (spec.incrementalCreate && tr.docChanged && !forced) {
            // Incremental recompute: map the existing decorations forward, then
            // rebuild only the blocks the edit touched via `createInRange`. The
            // extension's full-document `create` never runs here.
            const previousSet = previous.decorationSetsByExtension[name] ?? DecorationSet.empty
            const widgetKeys = new Set(previous.widgetKeysByExtension[name])

            let set = previousSet.map(tr.mapping, tr.doc, {
              onRemove: removedSpec => {
                const key = (removedSpec as { key?: unknown } | undefined)?.key

                if (typeof key === 'string') {
                  widgetKeys.delete(key)
                }
              },
            })

            for (const { from, to } of getBlockAlignedChangedRanges(tr, newState.doc)) {
              // Drop the now-stale decorations anchored in this range (and their
              // keys). We match by `from` rather than by overlap so we only
              // remove decorations `createInRange` will regenerate — a neighbour
              // block's decoration whose edge merely touches this range boundary
              // (e.g. a heading node decoration ending at the block start) is
              // left untouched.
              const stale = set
                .find(from, to)
                .filter(decoration => decoration.from >= from && decoration.from < to)

              for (const decoration of stale) {
                const key = widgetKeyOf(decoration)

                if (key) {
                  widgetKeys.delete(key)
                }
              }

              set = set.remove(stale)

              // …and rebuild just this range.
              const { decorations, widgetKeys: addedKeys } = descriptorsToDecorations(
                spec.createInRange({ editor, state: newState, view: editor.view, from, to }),
                name,
              )

              set = set.add(newState.doc, decorations)

              for (const key of addedKeys) {
                widgetKeys.add(key)
              }
            }

            decorationSetsByExtension[name] = set
            widgetKeysByExtension[name] = widgetKeys
            recomputed = true
          } else {
            const { set, widgetKeys } = buildExtensionDecorationSet(newState, spec, name)

            decorationSetsByExtension[name] = set
            widgetKeysByExtension[name] = widgetKeys
            recomputed = true
          }
        }

        // Nothing was recomputed and positions did not move — reuse the
        // previous state so the view doesn't see a decoration change.
        if (!recomputed && !tr.docChanged) {
          return previous
        }

        let mergedDecorationSet: DecorationSet

        if (singleExtensionName) {
          // Single extension: the merged set is that extension's set.
          mergedDecorationSet = decorationSetsByExtension[singleExtensionName]
        } else if (recomputed) {
          // Some extension changed: rebuild the union once.
          mergedDecorationSet = mergeDecorationSets(newState.doc, decorationSetsByExtension)
        } else {
          // Only positions moved: map the previous merged set forward instead of
          // re-flattening and rebuilding every extension's set.
          mergedDecorationSet = previous.mergedDecorationSet.map(tr.mapping, tr.doc)
        }

        return {
          decorationSetsByExtension,
          widgetKeysByExtension,
          mergedDecorationSet,
          widgetKeys: unionWidgetKeys(widgetKeysByExtension),
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

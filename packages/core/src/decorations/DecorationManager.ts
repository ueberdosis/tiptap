import type { Node } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { DecorationSet } from '@tiptap/pm/view'

import type { Editor } from '../Editor.js'
import { DECORATION_MANAGER_PLUGIN_KEY } from './constants.js'
import type { Decoration } from './Decoration.js'
import { buildDecorationSet } from './helpers/buildDecorationSet.js'
import { decorationsToPMDecorations } from './helpers/decorationsToPMDecorations.js'
import { filterOutOfRangeDecorations } from './helpers/filterOutOfRangeDecorations.js'
import { getRebuildRanges } from './helpers/getRebuildRanges.js'
import { mapDecorationSetForward } from './helpers/mapDecorationSetForward.js'
import { mergeDecorationSets } from './helpers/mergeDecorationSets.js'
import { replaceRecomputedDecorationSets } from './helpers/replaceRecomputedDecorationSets.js'
import { unionWidgetKeys } from './helpers/unionWidgetKeys.js'
import { validateDecorationSpec } from './helpers/validateDecorationSpec.js'
import { widgetKeyOf } from './helpers/widgetKeyOf.js'
import type {
  DecorationCreateProps,
  DecorationManagerEntry,
  DecorationManagerState,
  DecorationMeta,
  DecorationRangeProps,
  DecorationShouldUpdateProps,
  DecorationSpec,
  ResolvedDecorationEntry,
} from './types.js'
export type { DecorationManagerEntry } from './types.js'

const EMPTY_KEYS: ReadonlySet<string> = new Set()

export function liveWidgetKeys(editor: Editor): ReadonlySet<string> {
  return editor.extensionManager?.decorationManager?.liveWidgetKeys() ?? EMPTY_KEYS
}

export class DecorationManager {
  editor: Editor
  entries: ResolvedDecorationEntry[]
  plugin: Plugin<DecorationManagerState> | null

  constructor(options: { editor: Editor; entries: DecorationManagerEntry[] }) {
    this.editor = options.editor
    this.entries = this.resolveEntries(options.entries)
    this.entries.forEach(({ name, spec }) => validateDecorationSpec(name, spec))
    this.plugin = this.entries.length > 0 ? this.createPlugin() : null
  }

  /**
   * Returns the set of live widget keys from all decoration extensions.
   * @returns A readonly set of widget keys
   */
  liveWidgetKeys(): ReadonlySet<string> {
    return DECORATION_MANAGER_PLUGIN_KEY.getState(this.editor.state)?.widgetKeys ?? EMPTY_KEYS
  }

  /**
   * The mounted editor view, or `null` when destroyed. Decoration callbacks
   * must never receive the placeholder view `editor.view` falls back to.
   * @returns The mounted editor view, or `null`
   */
  private get mountedView(): EditorView | null {
    return this.editor.isDestroyed ? null : this.editor.view
  }

  /**
   * Resolves decoration entries by calling the addDecorations function for each extension entry.
   * @param entries The decoration manager entries to resolve
   * @returns An array of resolved decoration entries
   */
  private resolveEntries(entries: DecorationManagerEntry[]): ResolvedDecorationEntry[] {
    const resolved: ResolvedDecorationEntry[] = []

    for (const { name, addDecorations } of entries) {
      const spec = addDecorations()

      if (spec) {
        resolved.push({ name, spec })
      }
    }

    return resolved
  }

  /**
   * Creates the ProseMirror plugin for managing decorations.
   * @returns A ProseMirror plugin with state management
   */
  private createPlugin(): Plugin<DecorationManagerState> {
    const { editor, entries } = this

    return new Plugin<DecorationManagerState>({
      key: DECORATION_MANAGER_PLUGIN_KEY,
      state: {
        init: (_config, state) => {
          const decorationSetsByExtension: Record<string, DecorationSet> = {}
          const widgetKeysByExtension: Record<string, Set<string>> = {}

          for (const { name, spec } of entries) {
            const { set, widgetKeys } = this.buildFullSet(name, spec, state)

            decorationSetsByExtension[name] = set
            widgetKeysByExtension[name] = widgetKeys
          }

          return {
            decorationSetsByExtension,
            widgetKeysByExtension,
            mergedDecorationSet: this.buildMergedSet(state.doc, decorationSetsByExtension),
            widgetKeys: unionWidgetKeys(widgetKeysByExtension),
          }
        },
        apply: (tr, previous, oldState, newState) => {
          const meta = tr.getMeta(DECORATION_MANAGER_PLUGIN_KEY) as DecorationMeta | undefined
          const forceAll = meta?.type === 'force' && !meta.name
          const forceName = meta?.type === 'force' ? meta.name : undefined

          const decorationSetsByExtension: Record<string, DecorationSet> = {}
          const widgetKeysByExtension: Record<string, Set<string>> = {}
          const recomputedNames = new Set<string>()

          for (const { name, spec } of entries) {
            const forced = forceAll || forceName === name
            const wantsRecompute = this.wantsRecompute(
              spec,
              { editor, tr, oldState, newState },
              forced,
            )

            if (!wantsRecompute) {
              const result = this.applyMapForward(name, previous, tr)
              decorationSetsByExtension[name] = result.set
              widgetKeysByExtension[name] = result.widgetKeys
            } else if (spec.update === 'changedRanges' && tr.docChanged && !forced) {
              const result = this.applyChangedRangesRecompute(name, spec, previous, tr, newState)

              decorationSetsByExtension[name] = result.set
              widgetKeysByExtension[name] = result.widgetKeys
              recomputedNames.add(name)
            } else {
              const { set, widgetKeys } = this.buildFullSet(name, spec, newState)

              decorationSetsByExtension[name] = set
              widgetKeysByExtension[name] = widgetKeys
              recomputedNames.add(name)
            }
          }

          if (recomputedNames.size === 0 && !tr.docChanged) {
            return previous
          }

          const mergedDecorationSet = this.mergeAfterApply({
            entries,
            previous,
            tr,
            decorationSetsByExtension,
            recomputedNames,
          })

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
          return (
            DECORATION_MANAGER_PLUGIN_KEY.getState(state)?.mergedDecorationSet ??
            DecorationSet.empty
          )
        },
      },
    })
  }

  /**
   * Determines if a decoration spec should be recomputed based on the current transaction and state.
   * @param spec The decoration spec to check
   * @param props Properties containing editor, transaction, and state
   * @param forced Whether recomputation was forced
   * @returns True if the decoration should be recomputed
   */
  private wantsRecompute(
    spec: DecorationSpec,
    props: DecorationShouldUpdateProps,
    forced: boolean,
  ): boolean {
    if (forced) {
      return true
    }

    if (spec.update === 'manual') {
      return false
    }

    return spec.shouldUpdate ? spec.shouldUpdate(props) : props.tr.docChanged
  }

  /**
   * Applies a forward mapping to a decoration set, dropping stale decorations and updating widget keys.
   * @param name The name of the decoration extension
   * @param previous The previous decoration manager state
   * @param tr The transaction to map forward
   * @returns The updated decoration set and widget keys
   */
  private applyMapForward(
    name: string,
    previous: DecorationManagerState,
    tr: Transaction,
  ): { set: DecorationSet; widgetKeys: Set<string> } {
    const previousSet = previous.decorationSetsByExtension[name] ?? DecorationSet.empty
    const widgetKeys = new Set<string>(previous.widgetKeysByExtension[name] ?? [])

    const set = mapDecorationSetForward(previousSet, tr.mapping, tr.doc, widgetKeys)

    return { set, widgetKeys }
  }

  /**
   * Applies changed ranges recomputation to a decoration set, dropping stale decorations and rebuilding only the touched blocks.
   * @param name The name of the decoration extension
   * @param spec The decoration spec
   * @param previous The previous decoration manager state
   * @param tr The transaction to apply
   * @param newState The new editor state
   * @returns The updated decoration set and widget keys
   */
  private applyChangedRangesRecompute(
    name: string,
    spec: DecorationSpec,
    previous: DecorationManagerState,
    tr: Transaction,
    newState: EditorState,
  ): { set: DecorationSet; widgetKeys: Set<string> } {
    const resolution = getRebuildRanges(tr, newState.doc)

    if (resolution.type === 'full') {
      return this.buildFullSet(name, spec, newState)
    }

    const previousSet = previous.decorationSetsByExtension[name] ?? DecorationSet.empty
    const widgetKeys = new Set<string>(previous.widgetKeysByExtension[name] ?? [])
    let set = mapDecorationSetForward(previousSet, tr.mapping, tr.doc, widgetKeys)

    for (const { from, to } of resolution.ranges) {
      // because a decoration at `to` belongs to the next block, only clear it
      // at the end of the document.
      const endOfDoc = newState.doc.content.size
      const stale = set
        .find(from, to)
        .filter(
          decoration =>
            decoration.from >= from && (decoration.from < to || decoration.from === endOfDoc),
        )

      for (const decoration of stale) {
        const key = widgetKeyOf(decoration)

        if (key) {
          widgetKeys.delete(key)
        }
      }

      set = set.remove(stale)

      const rangeDecorations = filterOutOfRangeDecorations(
        spec.createInRange!({
          editor: this.editor,
          state: newState,
          view: this.mountedView,
          from,
          to,
        } satisfies DecorationRangeProps),
        from,
        to,
        name,
      )
      const { decorations: pmDecorations, widgetKeys: addedKeys } = decorationsToPMDecorations(
        rangeDecorations,
        name,
      )

      set = set.add(newState.doc, pmDecorations)

      for (const key of addedKeys) {
        if (widgetKeys.has(key)) {
          console.warn(
            `[tiptap warn]: Duplicate widget decoration key "${key}" in extension ` +
              `"${name}". createInRange produced a key already live in another range. ` +
              'Widget decoration keys must be globally unique, otherwise ProseMirror ' +
              'misplaces the widget DOM. Use a stable, unique key (e.g. `comment-${id}`).',
          )
        }

        widgetKeys.add(key)
      }
    }

    return { set, widgetKeys }
  }

  /**
   * Builds a full decoration set for the entire document.
   * @param name The name of the decoration extension
   * @param spec The decoration spec
   * @param state The editor state
   * @returns The decoration set and widget keys
   */
  private buildFullSet(
    name: string,
    spec: DecorationSpec,
    state: EditorState,
  ): { set: DecorationSet; widgetKeys: Set<string> } {
    const decorations: Decoration[] = spec.create({
      editor: this.editor,
      state,
      view: this.mountedView,
    } satisfies DecorationCreateProps)

    return buildDecorationSet(state.doc, decorations, name)
  }

  /**
   * Builds the merged DecorationSet during init. Skips the merge for a
   * single extension since its per-extension set is already correct.
   * @param doc The document to build the merged set for.
   * @param decorationSetsByExtension The per-extension decoration sets.
   * @returns The merged decoration set.
   */
  private buildMergedSet(
    doc: Node,
    decorationSetsByExtension: Record<string, DecorationSet>,
  ): DecorationSet {
    const names = Object.keys(decorationSetsByExtension)

    if (names.length === 1) {
      return decorationSetsByExtension[names[0]]
    }

    return mergeDecorationSets(doc, decorationSetsByExtension)
  }

  /**
   * Computes the merged DecorationSet after apply. Single extension skips
   * the merge; no recompute maps forward; otherwise patches incrementally.
   */
  private mergeAfterApply({
    entries,
    previous,
    tr,
    decorationSetsByExtension,
    recomputedNames,
  }: {
    entries: ResolvedDecorationEntry[]
    previous: DecorationManagerState
    tr: Transaction
    decorationSetsByExtension: Record<string, DecorationSet>
    recomputedNames: Set<string>
  }): DecorationSet {
    if (entries.length === 1) {
      return decorationSetsByExtension[entries[0].name]
    }

    if (recomputedNames.size === 0) {
      return previous.mergedDecorationSet.map(tr.mapping, tr.doc)
    }

    return replaceRecomputedDecorationSets({
      doc: tr.doc,
      mapping: tr.mapping,
      previousMergedSet: previous.mergedDecorationSet,
      decorationSetsByExtension,
      recomputedNames,
    })
  }
}

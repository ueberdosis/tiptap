import type { Node } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { DecorationSet } from '@tiptap/pm/view'

import type { Editor } from '../Editor.js'
import type { Range } from '../types.js'
import { isDev } from '../utilities/isDev.js'
import { DECORATION_MANAGER_PLUGIN_KEY } from './constants.js'
import type { Decoration } from './Decoration.js'
import { runInDecorationApplyScope } from './decorationApplyScope.js'
import { buildDecorationSet } from './helpers/buildDecorationSet.js'
import { decorationsToPMDecorations } from './helpers/decorationsToPMDecorations.js'
import { filterOutOfRangeDecorations } from './helpers/filterOutOfRangeDecorations.js'
import { findDuplicateWidgetKeys } from './helpers/findDuplicateWidgetKeys.js'
import { getRebuildRanges } from './helpers/getRebuildRanges.js'
import { mapDecorations } from './helpers/mapDecorations.js'
import { mapDecorationSet } from './helpers/mapDecorationSet.js'
import { mergeDecorationSets } from './helpers/mergeDecorationSets.js'
import { rangeOwnsPosition } from './helpers/rangeOwnsPosition.js'
import { unionWidgetKeys } from './helpers/unionWidgetKeys.js'
import { validateDecorationSpec } from './helpers/validateDecorationSpec.js'
import { shouldRecomputeDecoration } from './helpers/shouldRecomputeDecoration.js'
import { widgetKeyOf } from './helpers/widgetKeyOf.js'
import type {
  DecorationCreateProps,
  DecorationManagerEntry,
  DecorationManagerState,
  DecorationMeta,
  DecorationRangeProps,
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
  private warnedWidgetKeys = new Set<string>()
  private warnedOutOfRangeExtensions = new Set<string>()
  private readonly handleBeforeTransaction = ({ nextState }: { nextState: EditorState }) => {
    const state = DECORATION_MANAGER_PLUGIN_KEY.getState(nextState)

    if (state) {
      this.warnDuplicateWidgetKeys(state)
    }
  }

  constructor(options: { editor: Editor; entries: DecorationManagerEntry[] }) {
    this.editor = options.editor
    this.entries = this.resolveEntries(options.entries)
    this.entries.forEach(({ name, spec }) => validateDecorationSpec(name, spec))
    this.plugin = this.entries.length > 0 ? this.createPlugin() : null

    this.editor.on('beforeTransaction', this.handleBeforeTransaction)
  }

  destroy(): void {
    this.editor.off('beforeTransaction', this.handleBeforeTransaction)
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

          const managerState = {
            decorationSetsByExtension,
            widgetKeysByExtension,
            mergedDecorationSet: this.buildMergedSet(state.doc, decorationSetsByExtension),
            widgetKeys: unionWidgetKeys(widgetKeysByExtension),
          }

          this.warnDuplicateWidgetKeys(managerState)

          return managerState
        },
        apply: (tr, previous, oldState, newState) => {
          const meta = tr.getMeta(DECORATION_MANAGER_PLUGIN_KEY) as DecorationMeta | undefined
          const forceAll = meta?.type === 'force' && !meta.name
          const forceName = meta?.type === 'force' ? meta.name : undefined

          const decorationSetsByExtension: Record<string, DecorationSet> = {}
          const widgetKeysByExtension: Record<string, Set<string>> = {}
          const recomputedNames = new Set<string>()

          runInDecorationApplyScope(editor, () => {
            for (const { name, spec } of entries) {
              const forced = forceAll || forceName === name
              const shouldRecompute = shouldRecomputeDecoration(
                spec,
                { editor, tr, oldState, newState },
                forced,
              )

              if (!shouldRecompute) {
                const result = mapDecorations(name, previous, tr)
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
          })

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

    return this.rebuildRanges(name, spec, previous, tr, newState, resolution.ranges)
  }

  /**
   * Rebuilds decorations for the changed block ranges: maps the previous set
   * forward, then for each range removes stale decorations, calls
   * `createInRange`, and adds the new ones while syncing widget keys.
   * @param name The extension name.
   * @param spec The decoration spec.
   * @param previous The previous decoration manager state.
   * @param tr The transaction to apply.
   * @param newState The new editor state.
   * @param ranges The block ranges to rebuild.
   * @returns The updated decoration set and widget keys.
   */
  private rebuildRanges(
    name: string,
    spec: DecorationSpec,
    previous: DecorationManagerState,
    tr: Transaction,
    newState: EditorState,
    ranges: Range[],
  ): { set: DecorationSet; widgetKeys: Set<string> } {
    const previousSet = previous.decorationSetsByExtension[name] ?? DecorationSet.empty
    const widgetKeys = new Set<string>(previous.widgetKeysByExtension[name] ?? [])
    let set = mapDecorationSet(previousSet, tr.mapping, tr.doc, widgetKeys)

    const docSize = newState.doc.content.size

    for (const { from, to } of ranges) {
      const stale = set
        .find(from, to)
        .filter(decoration => rangeOwnsPosition({ position: decoration.from, from, to, docSize }))

      for (const decoration of stale) {
        const key = widgetKeyOf(decoration)

        if (key) {
          widgetKeys.delete(key)
        }
      }

      set = set.remove(stale)

      const rangeDecorations = filterOutOfRangeDecorations({
        decorations: this.runCreate(name, 'createInRange', () =>
          spec.createInRange!({
            editor: this.editor,
            state: newState,
            view: this.mountedView,
            from,
            to,
          } satisfies DecorationRangeProps),
        ),
        from,
        to,
        docSize,
        extensionName: name,
        warnedExtensions: this.warnedOutOfRangeExtensions,
      })
      const { decorations: pmDecorations, widgetKeys: addedKeys } = decorationsToPMDecorations(
        rangeDecorations,
        name,
      )

      set = set.add(newState.doc, pmDecorations)

      for (const key of addedKeys) {
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
    const decorations = this.runCreate(name, 'create', () =>
      spec.create({
        editor: this.editor,
        state,
        view: this.mountedView,
      } satisfies DecorationCreateProps),
    )

    return buildDecorationSet(state.doc, decorations, name)
  }

  /**
   * Runs a decoration callback and swallows anything it throws. These run inside
   * `state.apply`, where an uncaught error would abort the whole transaction.
   * @param name The extension name.
   * @param method The callback name, used in the error message.
   * @param create The callback to run.
   * @returns The decorations, or an empty array if the callback threw.
   */
  private runCreate(
    name: string,
    method: 'create' | 'createInRange',
    create: () => Decoration[],
  ): Decoration[] {
    try {
      return create()
    } catch (error) {
      console.error(
        `[tiptap error]: Extension "${name}" threw in \`addDecorations().${method}()\`. ` +
          'Its decorations were dropped for this update.',
        error,
      )

      return []
    }
  }

  private warnDuplicateWidgetKeys(state: DecorationManagerState): void {
    if (!isDev) {
      return
    }

    // No widget keys means no duplicates, so the scan over the merged set is
    // pointless. Most documents carry only node and inline decorations.
    if (state.widgetKeys.size === 0) {
      this.warnedWidgetKeys.clear()

      return
    }

    const duplicateKeys = findDuplicateWidgetKeys(state.mergedDecorationSet)
    const nextWarningKeys = new Set(duplicateKeys.map(({ key }) => key))

    for (const { key, extensions } of duplicateKeys) {
      if (this.warnedWidgetKeys.has(key)) {
        continue
      }

      const names = Array.from(extensions)
        .map(name => `"${name}"`)
        .join(', ')

      console.warn(
        `[tiptap warn]: Duplicate widget decoration key "${key}" in extension${
          extensions.size === 1 ? '' : 's'
        } ${names}. Widget decoration keys must be globally unique, otherwise ProseMirror ` +
          'misplaces the widget DOM. Use a stable, unique key (e.g. `comment-${id}`).',
      )
    }

    this.warnedWidgetKeys = nextWarningKeys
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
   * Computes the merged DecorationSet after apply. Single extension skips the
   * merge; nothing recomputed maps the previous merged set forward; otherwise
   * the merge is rebuilt from the per-extension sets.
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

    // Patching the previous merged set is far slower than rebuilding it:
    // `DecorationSet.remove` scans every decoration once per block, so it goes
    // quadratic on large documents. Every set here already matches `tr.doc`.
    return mergeDecorationSets(tr.doc, decorationSetsByExtension)
  }
}

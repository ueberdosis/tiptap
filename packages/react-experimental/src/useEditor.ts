import type { EditorOptions } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import type { DependencyList, RefObject } from 'react'
import { useDebugValue, useEffect, useRef, useState } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim/index.js'

import { createRendererEditor, latestCallbacks } from './hooks/useReactEditor.js'
import { useEditorState } from './useEditorState.js'

// @ts-ignore -- bundler-replaced global, no node types in this package
const isDev = process.env.NODE_ENV !== 'production'
const isSSR = typeof window === 'undefined'
const isNext =
  isSSR || Boolean(typeof window !== 'undefined' && (window as { next?: unknown }).next)

/**
 * The options for the `useEditor` hook.
 */
export type UseEditorOptions = Partial<EditorOptions> & {
  /**
   * Whether to render the editor on the first render.
   * If client-side rendering, set this to `true`.
   * If server-side rendering, set this to `false`.
   * @default true
   */
  immediatelyRender?: boolean
  /**
   * Whether to re-render the editor on each transaction.
   * This is legacy behavior that will be removed in future versions.
   * @default false
   */
  shouldRerenderOnTransaction?: boolean
}

/** Destroyed editors have their extensionManager nulled by `destroy()`. */
const isDestroyedInstance = (editor: Editor): boolean => !editor.extensionManager

/**
 * The renderer constructs the editor unmounted; a user-supplied element (or
 * the hook-only flags) must not leak into the editor options.
 */
const toEditorOptions = (options: UseEditorOptions): Partial<EditorOptions> => {
  const {
    element: _element,
    immediatelyRender: _ir,
    shouldRerenderOnTransaction: _rr,
    ...rest
  } = options

  return rest
}

/**
 * Handles the creation, destruction, and re-creation of the editor instance.
 * Ported from `@tiptap/react`'s `EditorInstanceManager` for drop-in
 * semantics (`immediatelyRender`, deps-based recreation, options drift via
 * `setOptions`); construction goes through `createRendererEditor` so the
 * React renderer owns the document DOM.
 */
class EditorInstanceManager {
  private editor: Editor | null = null

  /** The most recent options to apply to the editor. */
  private options: RefObject<UseEditorOptions>

  /** Notified when the editor instance is created or destroyed. */
  private subscriptions = new Set<() => void>()

  /** Destroys the editor if it was not mounted within a grace period. */
  private scheduledDestructionTimeout: ReturnType<typeof setTimeout> | undefined

  private isComponentMounted = false

  private previousDeps: DependencyList | null = null

  /** Identifies the instance; regenerated whenever a new one is set. */
  public instanceId = ''

  constructor(options: RefObject<UseEditorOptions>) {
    this.options = options
    this.setEditor(this.getInitialEditor())
    this.scheduleDestroy()

    this.getEditor = this.getEditor.bind(this)
    this.getServerSnapshot = this.getServerSnapshot.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.onRender = this.onRender.bind(this)
  }

  private setEditor(editor: Editor | null) {
    this.editor = editor
    this.instanceId = Math.random().toString(36).slice(2, 9)

    this.subscriptions.forEach(cb => cb())
  }

  /**
   * SSR renders no editor; Next.js defaults to deferred creation to avoid
   * hydration mismatches — mirroring the legacy `useEditor` behavior.
   */
  private getInitialEditor(): Editor | null {
    const explicit = this.options.current.immediatelyRender
    let immediatelyRender = explicit ?? true

    if (isSSR) {
      if (immediatelyRender && isDev) {
        console.warn(
          'SSR detected. `immediatelyRender` has been set to false to avoid hydration mismatches',
        )
      }
      immediatelyRender = false
    } else if (isNext && explicit === undefined) {
      immediatelyRender = false
      if (isDev) {
        console.warn(
          'Next.js detected. `immediatelyRender` defaults to false to avoid hydration mismatches. Pass `immediatelyRender: true` explicitly if you are rendering the editor only on the client.',
        )
      }
    }

    return immediatelyRender ? this.createEditor() : null
  }

  private createEditor(): Editor {
    return createRendererEditor({
      ...toEditorOptions(this.options.current),
      ...latestCallbacks(this.options),
    })
  }

  getEditor(): Editor | null {
    return this.editor
  }

  /** Always disable the editor on the server side. */
  getServerSnapshot(): null {
    return null
  }

  subscribe(onStoreChange: () => void) {
    this.subscriptions.add(onStoreChange)

    return () => {
      this.subscriptions.delete(onStoreChange)
    }
  }

  static compareOptions(a: UseEditorOptions, b: UseEditorOptions) {
    return (Object.keys(a) as (keyof UseEditorOptions)[]).every(key => {
      if (
        [
          'onCreate',
          'onBeforeCreate',
          'onDestroy',
          'onUpdate',
          'onTransaction',
          'onFocus',
          'onBlur',
          'onSelectionUpdate',
          'onContentError',
          'onDrop',
          'onPaste',
        ].includes(key)
      ) {
        // Callbacks are routed through the options ref, never compared
        return true
      }

      // Extensions are often inlined in the options object, so compare
      // element-wise rather than by array identity
      if (key === 'extensions' && a.extensions && b.extensions) {
        if (a.extensions.length !== b.extensions.length) {
          return false
        }
        return a.extensions.every((extension, index) => extension === b.extensions?.[index])
      }
      return a[key] === b[key]
    })
  }

  /**
   * On each render: create, update, or keep the editor instance.
   */
  onRender(deps: DependencyList) {
    return () => {
      this.isComponentMounted = true
      clearTimeout(this.scheduledDestructionTimeout)

      if (this.editor && !isDestroyedInstance(this.editor) && deps.length === 0) {
        // Live instance with empty deps: sync drifted options in place —
        // cheaper than re-creating the editor
        if (!EditorInstanceManager.compareOptions(this.options.current, this.editor.options)) {
          this.editor.setOptions({
            ...toEditorOptions(this.options.current),
            editable: this.editor.isEditable,
          })
        }
      } else {
        // Missing, destroyed, or deps changed: re-initialize
        this.refreshEditorInstance(deps)
      }

      return () => {
        this.isComponentMounted = false
        this.scheduleDestroy()
      }
    }
  }

  private refreshEditorInstance(deps: DependencyList) {
    if (this.editor && !isDestroyedInstance(this.editor)) {
      if (this.previousDeps === null) {
        // First mount of a live instance: adopt the deps, keep the editor
        this.previousDeps = deps
        return
      }
      const depsAreEqual =
        this.previousDeps.length === deps.length &&
        this.previousDeps.every((dep, index) => dep === deps[index])

      if (depsAreEqual) {
        return
      }
      this.editor.destroy()
    }

    this.setEditor(this.createEditor())
    this.previousDeps = deps
  }

  /**
   * Destroys the instance unless the component is (still or again) mounted
   * with the same instance one tick later — the StrictMode grace period.
   */
  private scheduleDestroy() {
    const currentInstanceId = this.instanceId
    const currentEditor = this.editor

    this.scheduledDestructionTimeout = setTimeout(() => {
      if (this.isComponentMounted && this.instanceId === currentInstanceId) {
        // Still mounted with the same instance: just re-apply the options,
        // they might have changed between ticks
        if (currentEditor && !isDestroyedInstance(currentEditor)) {
          currentEditor.setOptions(toEditorOptions(this.options.current))
        }
        return
      }
      if (currentEditor && !isDestroyedInstance(currentEditor)) {
        currentEditor.destroy()
        if (this.instanceId === currentInstanceId) {
          this.setEditor(null)
        }
      }
    }, 1)
  }
}

/**
 * Creates an editor instance rendered by the React renderer, with the
 * legacy `@tiptap/react` `useEditor` contract: `immediatelyRender: false`
 * defers creation past the first render (SSR-safe, returns `null` until
 * mounted), `deps` recreate the instance, other option changes are synced
 * in place, and `shouldRerenderOnTransaction` re-renders the owner per
 * transaction.
 * @example const editor = useEditor({ extensions: [...] })
 */
export function useEditor(
  options: UseEditorOptions & { immediatelyRender: false },
  deps?: DependencyList,
): Editor | null

/**
 * Creates an editor instance rendered by the React renderer, with the
 * legacy `@tiptap/react` `useEditor` contract.
 * @example const editor = useEditor({ extensions: [...] })
 */
export function useEditor(options: UseEditorOptions, deps?: DependencyList): Editor

export function useEditor(
  options: UseEditorOptions = {},
  deps: DependencyList = [],
): Editor | null {
  const mostRecentOptions = useRef(options)

  mostRecentOptions.current = options

  const [instanceManager] = useState(() => new EditorInstanceManager(mostRecentOptions))

  const editor = useSyncExternalStore(
    instanceManager.subscribe,
    instanceManager.getEditor,
    instanceManager.getServerSnapshot,
  )

  useDebugValue(editor)

  // This effect handles creating/updating the editor instance
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(instanceManager.onRender(deps))

  // Legacy opt-in: re-render the owning component on every transaction
  useEditorState({
    editor,
    selector: ({ transactionNumber }) => {
      if (
        options.shouldRerenderOnTransaction === false ||
        options.shouldRerenderOnTransaction === undefined
      ) {
        return null
      }

      // Avoid re-rendering on the first transaction with `immediatelyRender`
      if (options.immediatelyRender && transactionNumber === 0) {
        return 0
      }
      return transactionNumber + 1
    },
  })

  return editor
}

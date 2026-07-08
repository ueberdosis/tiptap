import type { EditorInternalOptions, EditorOptions } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import type { DependencyList, RefObject } from 'react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { ReactRendererExtension } from '../extension.js'
import type { ReactEditorViewPlace } from '../ReactEditorView.js'
import { ReactEditorView } from '../ReactEditorView.js'

export type UseReactEditorOptions = Partial<Omit<EditorOptions, 'element'>>

/** Destroyed editors have their extensionManager nulled by `destroy()`. */
const isDestroyedInstance = (editor: Editor): boolean => !editor.extensionManager

const sameDeps = (previous: DependencyList, next: DependencyList): boolean =>
  previous.length === next.length && previous.every((dep, index) => dep === next[index])

/** The editor event callbacks routed through the options ref. */
const CALLBACK_OPTIONS = [
  'onBeforeCreate',
  'onCreate',
  'onMount',
  'onUnmount',
  'onUpdate',
  'onSelectionUpdate',
  'onTransaction',
  'onFocus',
  'onBlur',
  'onDestroy',
  'onContentError',
  'onDrop',
  'onPaste',
  'onDelete',
] as const

type CallbackName = (typeof CALLBACK_OPTIONS)[number]

/**
 * Wraps every event callback so the editor always invokes the most recent
 * one from the options ref — no stale closures when the consumer re-renders
 * with new handlers.
 */
const latestCallbacks = (options: RefObject<UseReactEditorOptions>): Partial<EditorOptions> =>
  Object.fromEntries(
    CALLBACK_OPTIONS.map(name => [
      name,
      (...args: unknown[]) =>
        (options.current[name] as ((...inner: unknown[]) => void) | undefined)?.(...args),
    ]),
  ) as Pick<EditorOptions, CallbackName>

/**
 * Owns the editor instance across the component lifecycle. The mechanism
 * (adapted from `@tiptap/react`'s `useEditor`) exists for StrictMode and
 * concurrent rendering: React mounts, unmounts, and remounts effects — a
 * plain destroy-on-cleanup would kill the editor between the double-invoked
 * effects. Instead, cleanup only *schedules* destruction one tick out; a
 * remount before the tick cancels it, a real unmount lets it run.
 */
class ReactEditorManager {
  private editor: Editor

  private readonly options: RefObject<UseReactEditorOptions>

  private readonly subscriptions = new Set<() => void>()

  private destructionTimeout: ReturnType<typeof setTimeout> | undefined

  private mounted = false

  private previousDeps: DependencyList | null = null

  constructor(options: RefObject<UseReactEditorOptions>) {
    this.options = options
    this.editor = this.create()
    // If this render is thrown away without ever mounting, destroy the
    // instance after the grace period
    this.scheduleDestroy()

    this.subscribe = this.subscribe.bind(this)
    this.getEditor = this.getEditor.bind(this)
  }

  private create(): Editor {
    const current = this.options.current
    const editorOptions: Partial<EditorOptions> & EditorInternalOptions = {
      ...current,
      ...latestCallbacks(this.options),
      // EditorContent mounts on the rendered document element later;
      // ReactEditorView itself rejects function placements at runtime
      element: null,
      extensions: [...(current.extensions ?? []), ReactRendererExtension],
      __internalViewFactory: (element, props) =>
        new ReactEditorView(element as ReactEditorViewPlace, props),
    }

    return new Editor(editorOptions)
  }

  subscribe(onChange: () => void): () => void {
    this.subscriptions.add(onChange)
    return () => {
      this.subscriptions.delete(onChange)
    }
  }

  getEditor(): Editor {
    return this.editor
  }

  /** The every-render effect: keep alive while mounted, refresh when needed. */
  onRender(deps: DependencyList): () => () => void {
    return () => {
      this.mounted = true
      clearTimeout(this.destructionTimeout)
      this.refresh(deps)

      return () => {
        this.mounted = false
        this.scheduleDestroy()
      }
    }
  }

  /** Recreates the instance when it was destroyed or the deps changed. */
  private refresh(deps: DependencyList): void {
    if (!isDestroyedInstance(this.editor)) {
      if (this.previousDeps !== null && sameDeps(this.previousDeps, deps)) {
        return
      }
      if (this.previousDeps === null) {
        // First mount of a live instance: adopt the deps, keep the editor
        this.previousDeps = deps
        return
      }
      this.editor.destroy()
    }

    this.editor = this.create()
    this.previousDeps = deps
    this.subscriptions.forEach(onChange => onChange())
  }

  /**
   * Destroys the instance unless the component is (still or again) mounted
   * with the same instance one tick later — the StrictMode grace period.
   */
  private scheduleDestroy(): void {
    const scheduledEditor = this.editor

    this.destructionTimeout = setTimeout(() => {
      if (this.mounted && this.editor === scheduledEditor) {
        return
      }
      if (!isDestroyedInstance(scheduledEditor)) {
        scheduledEditor.destroy()
      }
    }, 1)
  }
}

/**
 * Creates a Tiptap editor wired to the React renderer: the editor is
 * constructed unmounted (`element: null`) and `EditorContent` mounts it onto
 * the React-rendered document element, where the internal view factory
 * substitutes a `ReactEditorView`.
 *
 * StrictMode-safe: unmount/remount cycles keep the instance; a real unmount
 * destroys it one tick later. Passing `deps` recreates the editor when they
 * change (like the legacy `useEditor`); with the default `[]` the instance
 * lives for the component's lifetime.
 */
export const useReactEditor = (
  options: UseReactEditorOptions = {},
  deps: DependencyList = [],
): Editor => {
  const optionsRef = useRef(options)

  optionsRef.current = options

  const [manager] = useState(() => new ReactEditorManager(optionsRef))
  const editor = useSyncExternalStore(manager.subscribe, manager.getEditor, manager.getEditor)

  // Runs on every render: the manager decides whether to keep, update, or
  // recreate the instance
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(manager.onRender(deps))

  return editor
}

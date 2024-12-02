import { type EditorOptions, Editor } from '@tiptap/core'
import {
  DependencyList,
  MutableRefObject,
  useDebugValue,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'

import { useEditorState } from './useEditorState.js'

const isDev = process.env.NODE_ENV !== 'production'
const isSSR = typeof window === 'undefined'
const isNext = isSSR || Boolean(typeof window !== 'undefined' && (window as any).next)

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
  immediatelyRender?: boolean;
  /**
   * Whether to re-render the editor on each transaction.
   * This is legacy behavior that will be removed in future versions.
   * @default true
   */
  shouldRerenderOnTransaction?: boolean;
};

/**
 * This class handles the creation, destruction, and re-creation of the editor instance.
 */
class EditorInstanceManager {
  /**
   * The current editor instance.
   */
  private editor: Editor | null = null

  /**
   * The most recent options to apply to the editor.
   */
  private options: MutableRefObject<UseEditorOptions>

  /**
   * The subscriptions to notify when the editor instance
   * has been created or destroyed.
   */
  private subscriptions = new Set<() => void>()

  /**
   * A timeout to destroy the editor if it was not mounted within a time frame.
   */
  private scheduledDestructionTimeout: ReturnType<typeof setTimeout> | undefined

  /**
   * Whether the editor has been mounted.
   */
  private isComponentMounted = false

  /**
   * The most recent dependencies array.
   */
  private previousDeps: DependencyList | null = null

  /**
   * The unique instance ID. This is used to identify the editor instance. And will be re-generated for each new instance.
   */
  public instanceId = ''

  constructor(options: MutableRefObject<UseEditorOptions>) {
    this.options = options
    this.subscriptions = new Set<() => void>()
    this.setEditor(this.getInitialEditor())
    this.scheduleDestroy()

    this.getEditor = this.getEditor.bind(this)
    this.getServerSnapshot = this.getServerSnapshot.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.refreshEditorInstance = this.refreshEditorInstance.bind(this)
    this.scheduleDestroy = this.scheduleDestroy.bind(this)
    this.onRender = this.onRender.bind(this)
    this.createEditor = this.createEditor.bind(this)
  }

  private setEditor(editor: Editor | null) {
    this.editor = editor
    this.instanceId = Math.random().toString(36).slice(2, 9)

    // Notify all subscribers that the editor instance has been created
    this.subscriptions.forEach(cb => cb())
  }

  private getInitialEditor() {
    if (this.options.current.immediatelyRender === undefined) {
      if (isSSR || isNext) {
        // TODO in the next major release, we should throw an error here
        if (isDev) {
          /**
           * Throw an error in development, to make sure the developer is aware that tiptap cannot be SSR'd
           * and that they need to set `immediatelyRender` to `false` to avoid hydration mismatches.
           */
          console.warn(
            'Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.',
          )
        }

        // Best faith effort in production, run the code in the legacy mode to avoid hydration mismatches and errors in production
        return null
      }

      // Default to immediately rendering when client-side rendering
      return this.createEditor()
    }

    if (this.options.current.immediatelyRender && isSSR && isDev) {
      // Warn in development, to make sure the developer is aware that tiptap cannot be SSR'd, set `immediatelyRender` to `false` to avoid hydration mismatches.
      throw new Error(
        'Tiptap Error: SSR has been detected, and `immediatelyRender` has been set to `true` this is an unsupported configuration that may result in errors, explicitly set `immediatelyRender` to `false` to avoid hydration mismatches.',
      )
    }

    if (this.options.current.immediatelyRender) {
      return this.createEditor()
    }

    return null
  }

  /**
   * Create a new editor instance. And attach event listeners.
   */
  private createEditor(): Editor {
    const optionsToApply: Partial<EditorOptions> = {
      ...this.options.current,
      // Always call the most recent version of the callback function by default
      onBeforeCreate: (...args) => this.options.current.onBeforeCreate?.(...args),
      onBlur: (...args) => this.options.current.onBlur?.(...args),
      onCreate: (...args) => this.options.current.onCreate?.(...args),
      onDestroy: (...args) => this.options.current.onDestroy?.(...args),
      onFocus: (...args) => this.options.current.onFocus?.(...args),
      onSelectionUpdate: (...args) => this.options.current.onSelectionUpdate?.(...args),
      onTransaction: (...args) => this.options.current.onTransaction?.(...args),
      onUpdate: (...args) => this.options.current.onUpdate?.(...args),
      onContentError: (...args) => this.options.current.onContentError?.(...args),
      onDrop: (...args) => this.options.current.onDrop?.(...args),
      onPaste: (...args) => this.options.current.onPaste?.(...args),
    }
    const editor = new Editor(optionsToApply)

    // no need to keep track of the event listeners, they will be removed when the editor is destroyed

    return editor
  }

  /**
   * Get the current editor instance.
   */
  getEditor(): Editor | null {
    return this.editor
  }

  /**
   * Always disable the editor on the server-side.
   */
  getServerSnapshot(): null {
    return null
  }

  /**
   * Subscribe to the editor instance's changes.
   */
  subscribe(onStoreChange: () => void) {
    this.subscriptions.add(onStoreChange)

    return () => {
      this.subscriptions.delete(onStoreChange)
    }
  }

  /**
   * On each render, we will create, update, or destroy the editor instance.
   * @param deps The dependencies to watch for changes
   * @returns A cleanup function
   */
  onRender(deps: DependencyList) {
    // The returned callback will run on each render
    return () => {
      this.isComponentMounted = true
      // Cleanup any scheduled destructions, since we are currently rendering
      clearTimeout(this.scheduledDestructionTimeout)

      if (this.editor && !this.editor.isDestroyed && deps.length === 0) {
        // if the editor does exist & deps are empty, we don't need to re-initialize the editor
        // we can fast-path to update the editor options on the existing instance
        this.editor.setOptions({
          ...this.options.current,
          editable: this.editor.isEditable,
        })
      } else {
        // When the editor:
        // - does not yet exist
        // - is destroyed
        // - the deps array changes
        // We need to destroy the editor instance and re-initialize it
        this.refreshEditorInstance(deps)
      }

      return () => {
        this.isComponentMounted = false
        this.scheduleDestroy()
      }
    }
  }

  /**
   * Recreate the editor instance if the dependencies have changed.
   */
  private refreshEditorInstance(deps: DependencyList) {
    if (this.editor && !this.editor.isDestroyed) {
      // Editor instance already exists
      if (this.previousDeps === null) {
        // If lastDeps has not yet been initialized, reuse the current editor instance
        this.previousDeps = deps
        return
      }
      const depsAreEqual = this.previousDeps.length === deps.length
        && this.previousDeps.every((dep, index) => dep === deps[index])

      if (depsAreEqual) {
        // deps exist and are equal, no need to recreate
        return
      }
    }

    if (this.editor && !this.editor.isDestroyed) {
      // Destroy the editor instance if it exists
      this.editor.destroy()
    }

    this.setEditor(this.createEditor())

    // Update the lastDeps to the current deps
    this.previousDeps = deps
  }

  /**
   * Schedule the destruction of the editor instance.
   * This will only destroy the editor if it was not mounted on the next tick.
   * This is to avoid destroying the editor instance when it's actually still mounted.
   */
  private scheduleDestroy() {
    const currentInstanceId = this.instanceId
    const currentEditor = this.editor

    // Wait two ticks to see if the component is still mounted
    this.scheduledDestructionTimeout = setTimeout(() => {
      if (this.isComponentMounted && this.instanceId === currentInstanceId) {
        // If still mounted on the following tick, with the same instanceId, do not destroy the editor
        if (currentEditor) {
          // just re-apply options as they might have changed
          currentEditor.setOptions(this.options.current)
        }
        return
      }
      if (currentEditor && !currentEditor.isDestroyed) {
        currentEditor.destroy()
        if (this.instanceId === currentInstanceId) {
          this.setEditor(null)
        }
      }
      // This allows the effect to run again between ticks
      // which may save us from having to re-create the editor
    }, 1)
  }
}

/**
 * This hook allows you to create an editor instance.
 * @param options The editor options
 * @param deps The dependencies to watch for changes
 * @returns The editor instance
 * @example const editor = useEditor({ extensions: [...] })
 */
export function useEditor(
  options: UseEditorOptions & { immediatelyRender: true },
  deps?: DependencyList
): Editor;

/**
 * This hook allows you to create an editor instance.
 * @param options The editor options
 * @param deps The dependencies to watch for changes
 * @returns The editor instance
 * @example const editor = useEditor({ extensions: [...] })
 */
export function useEditor(options?: UseEditorOptions, deps?: DependencyList): Editor | null;

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

  // This effect will handle creating/updating the editor instance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(instanceManager.onRender(deps))

  // The default behavior is to re-render on each transaction
  // This is legacy behavior that will be removed in future versions
  useEditorState({
    editor,
    selector: ({ transactionNumber }) => {
      if (options.shouldRerenderOnTransaction === false) {
        // This will prevent the editor from re-rendering on each transaction
        return null
      }

      // This will avoid re-rendering on the first transaction when `immediatelyRender` is set to `true`
      if (options.immediatelyRender && transactionNumber === 0) {
        return 0
      }
      return transactionNumber + 1
    },
  })

  return editor
}

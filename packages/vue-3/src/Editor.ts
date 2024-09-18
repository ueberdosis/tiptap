/* eslint-disable react-hooks/rules-of-hooks */
import { Editor as CoreEditor, EditorOptions } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import {
  AppContext,
  ComponentInternalInstance,
  ComponentPublicInstance,
  customRef,
  markRaw,
  Ref,
} from 'vue'

function useDebouncedRef<T>(value: T) {
  return customRef<T>((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        // update state
        value = newValue

        // update view as soon as possible
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            trigger()
          })
        })
      },
    }
  })
}

export type ContentComponent = ComponentInternalInstance & {
  ctx: ComponentPublicInstance
}

export class Editor extends CoreEditor {
  private reactiveState: Ref<EditorState>

  private reactiveExtensionStorage: Ref<Record<string, any>>

  public contentComponent: ContentComponent | null = null

  public appContext: AppContext | null = null

  constructor(options: Partial<EditorOptions> = {}) {
    super(options)

    this.reactiveState = useDebouncedRef(this.view.state)
    this.reactiveExtensionStorage = useDebouncedRef(this.extensionStorage)

    this.on('beforeTransaction', ({ nextState }) => {
      this.reactiveState.value = nextState
      this.reactiveExtensionStorage.value = this.extensionStorage
    })

    return markRaw(this) // eslint-disable-line
  }

  get state() {
    return this.reactiveState ? this.reactiveState.value : this.view.state
  }

  get storage() {
    return this.reactiveExtensionStorage ? this.reactiveExtensionStorage.value : super.storage
  }

  /**
   * Register a ProseMirror plugin.
   */
  public registerPlugin(
    plugin: Plugin,
    handlePlugins?: (newPlugin: Plugin, plugins: Plugin[]) => Plugin[],
  ): EditorState {
    const nextState = super.registerPlugin(plugin, handlePlugins)

    if (this.reactiveState) {
      this.reactiveState.value = nextState
    }

    return nextState
  }

  /**
   * Unregister a ProseMirror plugin.
   */
  public unregisterPlugin(nameOrPluginKey: string | PluginKey): EditorState | undefined {
    const nextState = super.unregisterPlugin(nameOrPluginKey)

    if (this.reactiveState && nextState) {
      this.reactiveState.value = nextState
    }

    return nextState
  }
}

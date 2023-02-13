import { Editor as CoreEditor, EditorOptions } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import {
  ComponentInternalInstance,
  ComponentPublicInstance,
  customRef,
  markRaw,
  reactive,
  Ref,
} from 'vue'

import { VueRenderer } from './VueRenderer'

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

  public vueRenderers = reactive<Map<string, VueRenderer>>(new Map())

  public contentComponent: ContentComponent | null = null

  constructor(options: Partial<EditorOptions> = {}) {
    super(options)

    this.reactiveState = useDebouncedRef(this.view.state)
    this.reactiveExtensionStorage = useDebouncedRef(this.extensionStorage)

    this.on('transaction', () => {
      this.reactiveState.value = this.view.state
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
  ): void {
    super.registerPlugin(plugin, handlePlugins)
    this.reactiveState.value = this.view.state
  }

  /**
   * Unregister a ProseMirror plugin.
   */
  public unregisterPlugin(nameOrPluginKey: string | PluginKey): void {
    super.unregisterPlugin(nameOrPluginKey)
    this.reactiveState.value = this.view.state
  }
}

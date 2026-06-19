import type { EditorOptions, Storage } from '@tiptap/core'
import { Editor as CoreEditor } from '@tiptap/core'
import type { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import type { Owner } from 'solid-js'
import { createSignal } from 'solid-js'

export type ContentComponent = {
  owner: Owner | null
}

export class Editor extends CoreEditor {
  private reactiveState: (() => EditorState) | undefined

  private setReactiveState: ((value: EditorState) => void) | undefined

  private reactiveExtensionStorage: (() => Storage) | undefined

  private setReactiveExtensionStorage: ((value: Storage) => void) | undefined

  public contentComponent: ContentComponent | null = null

  public isEditorContentInitialized = false

  constructor(options: Partial<EditorOptions> = {}) {
    super(options)

    const [state, setState] = createSignal<EditorState>(this.view.state)
    const [storage, setStorage] = createSignal<Storage>(this.extensionStorage)

    this.reactiveState = state
    this.setReactiveState = setState
    this.reactiveExtensionStorage = storage
    this.setReactiveExtensionStorage = setStorage

    this.on('beforeTransaction', ({ nextState }) => {
      this.setReactiveState?.(nextState)
      this.setReactiveExtensionStorage?.(this.extensionStorage)
    })
  }

  get state() {
    return this.reactiveState ? this.reactiveState() : this.view.state
  }

  get storage() {
    return this.reactiveExtensionStorage ? this.reactiveExtensionStorage() : super.storage
  }

  public registerPlugin(
    plugin: Plugin,
    handlePlugins?: (newPlugin: Plugin, plugins: Plugin[]) => Plugin[],
  ): EditorState {
    const nextState = super.registerPlugin(plugin, handlePlugins)

    this.setReactiveState?.(nextState)

    return nextState
  }

  public unregisterPlugin(nameOrPluginKey: string | PluginKey): EditorState | undefined {
    const nextState = super.unregisterPlugin(nameOrPluginKey)

    if (nextState) {
      this.setReactiveState?.(nextState)
    }

    return nextState
  }
}

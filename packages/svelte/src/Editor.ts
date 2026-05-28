import type { EditorOptions, Storage } from '@tiptap/core'
import { Editor as CoreEditor } from '@tiptap/core'
import type { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'

export class Editor extends CoreEditor {
  public reactiveState: EditorState = this.view.state

  public reactiveExtensionStorage: Storage = this.extensionStorage

  constructor(options: Partial<EditorOptions> = {}) {
    super(options)

    this.reactiveState = this.view.state
    this.reactiveExtensionStorage = this.extensionStorage

    this.on('beforeTransaction', ({ nextState }) => {
      this.reactiveState = nextState
      this.reactiveExtensionStorage = this.extensionStorage
    })
  }

  get state() {
    return this.reactiveState ?? this.view.state
  }

  get storage() {
    return this.reactiveExtensionStorage ?? super.storage
  }

  public registerPlugin(
    plugin: Plugin,
    handlePlugins?: (newPlugin: Plugin, plugins: Plugin[]) => Plugin[],
  ): EditorState {
    const nextState = super.registerPlugin(plugin, handlePlugins)

    if (this.reactiveState) {
      this.reactiveState = nextState
    }

    return nextState
  }

  public unregisterPlugin(nameOrPluginKey: string | PluginKey): EditorState | undefined {
    const nextState = super.unregisterPlugin(nameOrPluginKey)

    if (this.reactiveState && nextState) {
      this.reactiveState = nextState
    }

    return nextState
  }
}

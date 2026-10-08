import { Extension } from '@tiptap/core'

import { ServerAiToolkitHashExtension } from './hash-extension/server-ai-toolkit-hash-extension.js'
import { AiSelectionAwareness, type AiSelectionAwarenessOptions } from './selection-awareness.js'

/** Configuration for the Server AI Toolkit extension. */
export type ServerAiToolkitOptions = {
  /** Publish persistent selections using this provider and the server's selection user ID. */
  selectionAwareness: false | AiSelectionAwarenessOptions
}

/**
 * Server AI Toolkit extension.
 *
 * Registers stable document hashes and, when configured with a provider and user ID,
 * persistent selection awareness for server-side read and edit flows.
 */
export const ServerAiToolkit = Extension.create<ServerAiToolkitOptions>({
  name: 'serverAiToolkit',

  addOptions() {
    return { selectionAwareness: false }
  },

  /**
   * Registers internal extensions required by the Server AI Toolkit.
   *
   * @return The list of internal extensions.
   */
  addExtensions() {
    return [
      ServerAiToolkitHashExtension,
      ...(this.options.selectionAwareness
        ? [AiSelectionAwareness.configure(this.options.selectionAwareness)]
        : []),
    ]
  },
})

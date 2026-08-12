import { Extension } from '@tiptap/core'

import { ServerAiToolkitHashExtension } from './hash-extension/server-ai-toolkit-hash-extension.js'

/**
 * Server AI Toolkit extension.
 *
 * This package-level extension registers the internal hash extension used by
 * the Server AI Toolkit so server-side read and edit flows can rely on stable
 * `_hash` attributes already stored in the document.
 */
export const ServerAiToolkit = Extension.create({
  name: 'serverAiToolkit',

  /**
   * Registers internal extensions required by the Server AI Toolkit.
   *
   * @return The list of internal extensions.
   */
  addExtensions() {
    return [ServerAiToolkitHashExtension]
  },
})

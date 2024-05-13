import { ParseOptions } from '@tiptap/pm/model'

import { Content, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setContent: {
      /**
       * Replace the whole document with new content.
       * @param content The new content.
       * @param emitUpdate Whether to emit an update event.
       * @param parseOptions Options for parsing the content.
       * @example editor.commands.setContent('<p>Example text</p>')
       */
      setContent: (
        /**
         * The new content.
         */
        content: Content,

        /**
         * Whether to emit an update event.
         * @default false
         */
        emitUpdate?: boolean,

        /**
         * Options for parsing the content.
         * @default {}
         */
        parseOptions?: ParseOptions,
      ) => ReturnType
    }
  }
}

export const setContent: RawCommands['setContent'] = (content, emitUpdate = false, parseOptions = {}) => ({
  tr, commands,
}) => {
  const { doc } = tr

  tr.setMeta('preventUpdate', !emitUpdate)

  return commands.insertContentAt(
    { from: 0, to: doc.content.size },
    content,
    { parseOptions },
  )
}

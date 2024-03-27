import { ParseOptions } from '@tiptap/pm/model'

import { Content, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setContent: {
      /**
       * Replace the whole document with new content.
       */
      setContent: (
        content: Content,
        emitUpdate?: boolean,
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

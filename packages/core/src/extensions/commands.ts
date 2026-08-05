import * as commands from '../commands/index.js'
import { Extension } from '../Extension.js'

export * from '../commands/index.js'

/**
 * Registers the built-in commands on the editor.
 */
export const Commands = Extension.create({
  name: 'commands',

  addCommands() {
    return {
      ...commands,
    }
  },
})
